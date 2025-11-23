<?php

/**
 * Simple JavaScript minifier
 * Run with: php minify.php
 */

$source = file_get_contents(__DIR__ . '/resources/js/bladevalidator.js');

// Remove multi-line comments /* ... */
$minified = preg_replace('/\/\*[\s\S]*?\*\//', '', $source);

// Remove single-line comments // ...
$minified = preg_replace('/\/\/.*$/m', '', $minified);

// Remove extra whitespace
$minified = preg_replace('/\s+/', ' ', $minified);

// Remove whitespace around operators and brackets
$minified = preg_replace('/\s*([{}();,:])\s*/', '$1', $minified);

// Trim
$minified = trim($minified);

// Save minified version
file_put_contents(__DIR__ . '/resources/js/bladevalidator.min.js', $minified);

// Stats
$originalSize = strlen($source);
$minifiedSize = strlen($minified);
$saved = (1 - $minifiedSize / $originalSize) * 100;

echo "✓ Minified version created: resources/js/bladevalidator.min.js\n";
echo sprintf("Original size: %.2f KB\n", $originalSize / 1024);
echo sprintf("Minified size: %.2f KB\n", $minifiedSize / 1024);
echo sprintf("Saved: %.1f%%\n", $saved);
