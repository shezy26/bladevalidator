<?php

namespace BladeValidator;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;

class BladeValidatorServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Load routes
        $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');

        // Publish JavaScript assets (both versions)
        $this->publishes([
            __DIR__ . '/../resources/js/bladevalidator.js' => public_path('vendor/bladevalidator/bladevalidator.js'),
            __DIR__ . '/../resources/js/bladevalidator.min.js' => public_path('vendor/bladevalidator/bladevalidator.min.js'),
        ], 'bladevalidator-assets');

        // Register Blade directive
        Blade::directive('bladeValidator', function ($expression) {
            return "<?php echo BladeValidator\BladeDirective::script({$expression}); ?>";
        });
    }
}
