<?php

namespace BladeValidator;

class BladeDirective
{
    /**
     * Track if the script has already been included
     */
    private static $scriptIncluded = false;

    /**
     * Generate the JavaScript initialization code for BladeValidator
     *
     * @param string $requestClass The FormRequest class name
     * @param string $formSelector The form CSS selector
     * @param array $options Additional configuration options
     * @return string
     */
    public static function script($requestClass, $formSelector, $options = [])
    {
        // Default options
        $defaults = [
            'validateOn' => 'blur',
            'debounce' => 300,
            'errorClass' => 'is-invalid',
            'successClass' => 'is-valid',
            'errorDisplay' => 'default',
        ];

        // Merge with user options
        $config = array_merge($defaults, $options);

        // Escape form selector
        $formSelector = addslashes($formSelector);

        // Build the configuration object
        $configArray = [
            'request' => $requestClass,
            'validateOn' => $config['validateOn'],
            'debounce' => (int) $config['debounce'],
            'errorClass' => $config['errorClass'],
            'successClass' => $config['successClass'],
            'errorDisplay' => $config['errorDisplay'],
        ];

        $configJson = json_encode($configArray, JSON_UNESCAPED_SLASHES);

        // Include the script tag only once (on first use)
        $scriptTag = '';
        if (!self::$scriptIncluded) {
            $scriptTag = '<script src="' . asset('vendor/bladevalidator/bladevalidator.min.js') . '"></script>' . PHP_EOL;
            self::$scriptIncluded = true;
        }

        // Generate the initialization script
        return <<<HTML
{$scriptTag}<script>
document.addEventListener('DOMContentLoaded', function() {
    BladeValidator.init('{$formSelector}', {$configJson});
});
</script>
HTML;
    }
}
