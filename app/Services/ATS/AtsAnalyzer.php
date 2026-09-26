<?php

namespace App\Services\ATS;

use App\Models\Resume;
use Smalot\PdfParser\Parser;
use Spatie\PdfToText\Pdf;
use Throwable;

class AtsAnalyzer
{
    public function analyze(Resume $resume, ?string $jobDescription = null): array
    {
        $fullPath = public_path($resume->file_path);
        $extension = strtolower((string) $resume->extension);
        $extractedText = $this->extractText($fullPath, $extension);

        $text = str_replace("\r", "", $this->cleanUtf8($extractedText));

        if (mb_strlen(trim($text)) < 100) {
            return [
                'score'      => 0,
                'base_score' => 0,
                'word_count' => str_word_count($text),
                'message'    => 'Could not read enough text from this resume. Use a text-based PDF or DOCX file, not a scanned image.',
                'checks'     => [],
                'keywords'   => null,
            ];
        }

        $checks = [];
        $add = function (string $label, int $score, int $max, string $tip) use (&$checks) {
            $checks[] = [
                'label' => $label,
                'score' => $score,
                'max'   => $max,
                'tip'   => $score < $max ? $tip : null,
            ];
        };

        $hasKeyword = fn(array $keywords) => collect($keywords)->contains(
            fn($k) => stripos($text, $k) !== false
        );

        // Contact info checks (10)
        $add('Email', preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text) ? 4 : 0, 4, 'Add a professional email address.');
        $add('Phone', preg_match('/(?:\+\d{1,3}\s*)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/', $text) ? 3 : 0, 3, 'Add a phone number.');
        $add('LinkedIn / GitHub', preg_match('/linkedin|github|portfolio/i', $text) ? 3 : 0, 3, 'Add your LinkedIn or GitHub link.');

        // Standard sections checks (25)
        $add('Work experience section', $hasKeyword(['experience', 'work history', 'employment']) ? 8 : 0, 8, 'Add a clear "Work Experience" section.');
        $add('Education section', $hasKeyword(['education']) ? 6 : 0, 6, 'Add an "Education" section.');
        $add('Skills section', $hasKeyword(['skill']) ? 6 : 0, 6, 'Add a "Skills" section.');
        $add('Summary / objective', $hasKeyword(['objective', 'summary', 'profile']) ? 5 : 0, 5, 'Add a short summary at the top.');

        // Length checks (10)
        $words = str_word_count($text);
        $lengthScore = ($words >= 400 && $words <= 1000) ? 10 : (($words >= 250 && $words <= 1400) ? 6 : 2);
        $add('Resume length', $lengthScore, 10, 'Aim for 400-1000 words (1-2 pages).');

        // Quantified achievements (10)
        $numbers = preg_match_all('/\d+(?:\.\d+)?\s*%|[$৳]\s?\d[\d,]*|\b\d+\+|\b\d+x\b/iu', $text);
        $add('Quantified achievements', $numbers >= 3 ? 10 : ($numbers >= 1 ? 5 : 0), 10, 'Add measurable results (%, revenue, users, time saved).');

        // Action verbs (10)
        $verbs = ['developed', 'built', 'led', 'designed', 'implemented', 'optimized', 'migrated', 'architected',
            'managed', 'created', 'improved', 'reduced', 'increased', 'delivered', 'launched', 'integrated',
            'engineered', 'mentored', 'automated', 'deployed', 'maintained', 'analyzed', 'collaborated'];
        $usedVerbs = collect($verbs)->filter(fn($v) => preg_match('/\b' . $v . '\b/i', $text))->count();
        $add('Action verbs', $usedVerbs >= 6 ? 10 : ($usedVerbs >= 3 ? 6 : 2), 10, 'Start bullets with strong verbs (Built, Led, Optimized).');

        // Bullets (5)
        $bullets = preg_match_all('/^\s*[•●▪\-\*]/mu', $text);
        $add('Bullet points', $bullets >= 5 ? 5 : 2, 5, 'Use bullet points for responsibilities and achievements.');

        $basePct = (int) round(array_sum(array_column($checks, 'score')) / array_sum(array_column($checks, 'max')) * 100);

        // Job description match logic (optional)
        $keywords = null;
        $jd = trim((string) $jobDescription);

        if ($jd !== '') {
            $stop = ['the', 'and', 'for', 'with', 'you', 'our', 'are', 'will', 'have', 'has', 'this', 'that', 'from',
                'your', 'their', 'they', 'who', 'what', 'work', 'working', 'experience', 'years', 'year', 'team',
                'teams', 'ability', 'strong', 'good', 'including', 'such', 'etc', 'able', 'must', 'should', 'can',
                'all', 'any', 'more', 'other', 'new', 'use', 'using', 'join', 'role', 'job', 'looking', 'candidate',
                'responsibilities', 'requirements', 'required', 'preferred', 'skills', 'knowledge', 'understanding',
                'well', 'best', 'help', 'make', 'part', 'into', 'over', 'per', 'out', 'also', 'both', 'within',
                'across', 'based', 'related', 'plus', 'than', 'then', 'them', 'was', 'were', 'been', 'being', 'not',
                'but', 'company', 'position', 'looking', 'seeking'];

            preg_match_all('/[a-z][a-z0-9+#.\-]{2,}/i', mb_strtolower($jd), $m);
            $freq = array_count_values(array_map(fn($w) => rtrim($w, '.-'), $m[0]));
            $freq = array_diff_key($freq, array_flip($stop));
            arsort($freq);
            $terms = array_slice(array_keys($freq), 0, 30);

            $matched = [];
            $missing = [];
            foreach ($terms as $term) {
                if (preg_match('/(?<![\w])' . preg_quote($term, '/') . '(?![\w])/i', $text)) {
                    $matched[] = $term;
                } else {
                    $missing[] = $term;
                }
            }

            $keywords = [
                'score'   => $terms ? (int) round(count($matched) / count($terms) * 100) : 0,
                'matched' => $matched,
                'missing' => $missing,
            ];
        }

        $final = $keywords ? (int) round(($basePct + $keywords['score']) / 2) : $basePct;

        return [
            'score'      => $final,
            'base_score' => $basePct,
            'word_count' => $words,
            'checks'     => $checks,
            'keywords'   => $keywords,
        ];
    }

    private function extractText(string $fullPath, string $extension): string
    {
        if (!is_file($fullPath) || !is_readable($fullPath)) {
            return '';
        }

        return match ($extension) {
            'pdf' => $this->extractPdfText($fullPath),
            'docx' => $this->extractDocxText($fullPath),
            default => '',
        };
    }

    private function extractPdfText(string $fullPath): string
    {
        try {
            $text = Pdf::getText($fullPath);
            if (mb_strlen(trim($text)) >= 100) {
                return $text;
            }
        } catch (Throwable) {
            // Fall back to the PHP parser when pdftotext is unavailable or fails.
        }

        try {
            $parser = new Parser();
            return $parser->parseFile($fullPath)->getText();
        } catch (Throwable) {
            return '';
        }
    }

    private function extractDocxText(string $fullPath): string
    {
        if (!class_exists(\ZipArchive::class)) {
            return '';
        }

        $zip = new \ZipArchive();

        if ($zip->open($fullPath) !== true) {
            return '';
        }

        $xmlFiles = ['word/document.xml'];

        for ($index = 0; $index < $zip->numFiles; $index++) {
            $name = $zip->getNameIndex($index);
            if (preg_match('/^word\/(?:header|footer|footnotes|endnotes)\d*\.xml$/', $name)) {
                $xmlFiles[] = $name;
            }
        }

        $parts = [];

        foreach (array_unique($xmlFiles) as $xmlFile) {
            $xml = $zip->getFromName($xmlFile);
            if ($xml !== false) {
                $parts[] = $this->extractTextFromWordXml($xml);
            }
        }

        $zip->close();

        return trim(implode("\n", array_filter($parts)));
    }

    private function extractTextFromWordXml(string $xml): string
    {
        $document = new \DOMDocument();

        if (!$document->loadXML($xml, LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_NONET)) {
            return trim(html_entity_decode(strip_tags($xml)));
        }

        $xpath = new \DOMXPath($document);
        $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        $paragraphs = [];

        foreach ($xpath->query('//w:p') as $paragraph) {
            $line = '';

            foreach ($xpath->query('.//w:t | .//w:tab | .//w:br', $paragraph) as $node) {
                if ($node->localName === 'tab') {
                    $line .= ' ';
                    continue;
                }

                if ($node->localName === 'br') {
                    $line .= "\n";
                    continue;
                }

                $line .= $node->textContent;
            }

            $line = trim($line);
            if ($line !== '') {
                $paragraphs[] = $line;
            }
        }

        return implode("\n", $paragraphs);
    }

    private function cleanUtf8(string $text): string
    {
        $clean = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
        $clean = iconv('UTF-8', 'UTF-8//IGNORE', $clean);
        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $clean);
        return $clean ?? '';
    }
}