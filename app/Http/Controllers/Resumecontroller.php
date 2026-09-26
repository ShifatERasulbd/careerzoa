<?php

namespace App\Http\Controllers;

use App\Services\ATS\AtsAnalyzer;
use Smalot\PdfParser\Parser;
use Illuminate\Http\Request;
use App\Models\Resume;
use Illuminate\Http\JsonResponse;

class Resumecontroller extends Controller
{
    protected AtsAnalyzer $atsAnalyzer;

    public function __construct(AtsAnalyzer $atsAnalyzer)
    {
        $this->atsAnalyzer = $atsAnalyzer;
    }

    public function index(): JsonResponse
    {
        $resumes = auth()->user()->resumes()->latest()->get();

        return response()->json($resumes);
    }

    public function show(Request $request, Resume $resume): JsonResponse
    {
        $this->authorizeOwner($request, $resume);

        return response()->json($resume);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'resume' => 'required|file|mimes:pdf,docx|max:5120',
            'is_active' => 'sometimes|boolean',
        ]);

        $file = $request->file('resume');

        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $fileSize = $file->getSize();

        $filename = uniqid() . '_' . $originalName;
        $file->move(public_path('resume'), $filename);

        $filePath = 'resume/' . $filename;

        $parsedData = $this->extractResumeData($filePath, $originalName, $extension);

        $isActive = $request->boolean('is_active', true);

        // If the new resume will be active, deactivate all other resumes for this user
        if ($isActive) {
            Resume::where('user_id', $request->user()->id)->update(['is_active' => false]);
        }

        $resume = Resume::create([
            'user_id' => $request->user()->id,
            'file_path' => $filePath,
            'original_name' => $originalName,
            'extension' => $extension,
            'file_size' => $fileSize,
            'is_active' => $isActive,
            'parsed_data' => $parsedData,
        ]);

        return response()->json($resume, 201);
    }

    public function update(Request $request, Resume $resume): JsonResponse
    {
        $this->authorizeOwner($request, $resume);

        $validated = $request->validate([
            'resume' => 'sometimes|file|mimes:pdf,docx|max:5120',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('resume')) {
            $file = $request->file('resume');

            if ($resume->file_path && file_exists(public_path($resume->file_path))) {
                unlink(public_path($resume->file_path));
            }

            $filename = uniqid() . '_' . $file->getClientOriginalName();
            $file->move(public_path('resume'), $filename);

            $filePath = 'resume/' . $filename;
            $validated['file_path'] = $filePath;
            $validated['original_name'] = $file->getClientOriginalName();
            $validated['extension'] = $file->getClientOriginalExtension();
            $validated['file_size'] = $file->getSize();

            $validated['parsed_data'] = $this->extractResumeData(
                $filePath,
                $validated['original_name'],
                $validated['extension']
            );

            unset($validated['resume']);
        }

        if ($request->has('is_active')) {
            $validated['is_active'] = $request->boolean('is_active');

            // If this resume is being activated, deactivate all other resumes for this user
            if ($validated['is_active']) {
                Resume::where('user_id', $resume->user_id)
                    ->where('id', '!=', $resume->id)
                    ->update(['is_active' => false]);
            }
        }

        $resume->update($validated);

        return response()->json($resume);
    }

    public function destroy(Request $request, Resume $resume): JsonResponse
    {
        $this->authorizeOwner($request, $resume);

        if ($resume->file_path && file_exists(public_path($resume->file_path))) {
            unlink(public_path($resume->file_path));
        }

        $resume->delete();

        return response()->json(['message' => 'Resume deleted successfully']);
    }

    public function showParsed(Request $request, Resume $resume): JsonResponse
    {
        $this->authorizeOwner($request, $resume);

        if (!empty($resume->parsed_data)) {
            return response()->json($resume->parsed_data, 200, [], JSON_INVALID_UTF8_SUBSTITUTE);
        }

        $parsedData = $this->extractResumeData($resume->file_path, $resume->original_name, $resume->extension);
        $resume->update(['parsed_data' => $parsedData]);

        return response()->json($parsedData, 200, [], JSON_INVALID_UTF8_SUBSTITUTE);
    }

    public function atsScore(Request $request, Resume $resume): JsonResponse
    {
        $this->authorizeOwner($request, $resume);

        $request->validate([
            'job_description' => 'nullable|string|max:30000',
        ]);

        $result = $this->atsAnalyzer->analyze(
            $resume,
            $request->input('job_description')
        );

        return response()->json($result);
    }

    /**
     * Ensure the authenticated user owns this resume.
     * Aborts with 401 if not authenticated, 403 if owned by someone else.
     */
    private function authorizeOwner(Request $request, Resume $resume): void
    {
        abort_if($request->user() === null, 401, 'Unauthenticated.');
       if ($request->user()->id !== $resume->user_id) {
    dd([
        'logged_in_user_id' => $request->user()->id,
        'resume_owner_id'   => $resume->user_id,
        'resume_id'         => $resume->id,
    ]);
}

        abort_unless($request->user()->id === $resume->user_id, 403, 'You do not own this resume.');
    }

    private function extractResumeData(string $filePath, string $originalName, string $extension): array
    {
        $fullPath = public_path($filePath);
        $extractedText = '';

        if ($extension === 'pdf' && file_exists($fullPath)) {
            $parser = new Parser();
            $pdf = $parser->parseFile($fullPath);
            $extractedText = $pdf->getText();
        }

        $extractedText = $this->cleanUtf8($extractedText);
        $text = str_replace("\r", "", $extractedText);

        $rawLines = array_values(array_filter(
            array_map('trim', explode("\n", $text)),
            fn($l) => $l !== ''
        ));

        $bullets = ['•', '●', '▪', '-', '–', '*'];
        $lines = [];
        for ($i = 0; $i < count($rawLines); $i++) {
            if (in_array($rawLines[$i], $bullets, true) && isset($rawLines[$i + 1])) {
                $lines[] = '• ' . $rawLines[++$i];
                continue;
            }
            $lines[] = $rawLines[$i];
        }

        $nameLine = null;
        foreach ($lines as $line) {
            if (preg_match('/@/', $line) || preg_match('/\d{3,}/', $line)) {
                continue;
            }
            $nameLine = $line;
            break;
        }
        $name = $nameLine ?? pathinfo($originalName, PATHINFO_FILENAME);

        $email = null;
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $m)) {
            $email = $m[0];
        }

        $phone = null;
        if (preg_match('/(?:\+\d{1,3}\s*)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/', $text, $m)) {
            $phone = $m[0];
        }

        $headingHits = [];
        foreach ($lines as $i => $line) {
            if ($line === $nameLine) {
                continue;
            }

            $letterOnly = preg_replace('/[^\p{L}]/u', '', $line);
            if (mb_strlen($letterOnly) < 3) {
                continue;
            }
            if (preg_match('/[\d@|:•]/u', $line)) {
                continue;
            }
            if (str_word_count($line) > 6) {
                continue;
            }

            $upper = mb_strtoupper($line, 'UTF-8');
            $lower = mb_strtolower($line, 'UTF-8');
            if ($line === $upper && $line !== $lower) {
                $headingHits[] = ['index' => $i, 'heading' => $line, 'key' => $this->slugify($line)];
            }
        }

        $sections = [];
        foreach ($headingHits as $idx => $hit) {
            $start = $hit['index'] + 1;
            $end = $headingHits[$idx + 1]['index'] ?? count($lines);
            $content = trim(implode("\n", array_slice($lines, $start, $end - $start)));

            if ($content === '') {
                continue;
            }

            $sections[] = [
                'heading' => $hit['heading'],
                'key'     => $hit['key'],
                'content' => $content,
            ];
        }

        return [
            'personal_info' => [
                'name'  => ucwords(strtolower($name)),
                'email' => $email ?? 'Not found',
                'phone' => $phone ?? 'Not found',
            ],
            'sections' => $sections,
            'raw_text' => $text,
        ];
    }

    private function slugify(string $heading): string
    {
        $slug = mb_strtolower($heading, 'UTF-8');
        $slug = preg_replace('/[^\p{L}\p{N}]+/u', '_', $slug);
        return trim($slug, '_');
    }

    private function cleanUtf8(string $text): string
    {
        $clean = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
        $clean = iconv('UTF-8', 'UTF-8//IGNORE', $clean);
        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $clean);
        return $clean ?? '';
    }
}