# BladeValidator

[![Latest Version](https://img.shields.io/packagist/v/bladevalidator/bladevalidator.svg?style=flat-square)](https://packagist.org/packages/bladevalidator/bladevalidator)
[![Total Downloads](https://img.shields.io/packagist/dt/bladevalidator/bladevalidator.svg?style=flat-square)](https://packagist.org/packages/bladevalidator/bladevalidator)
[![License](https://img.shields.io/packagist/l/bladevalidator/bladevalidator.svg?style=flat-square)](https://packagist.org/packages/bladevalidator/bladevalidator)

Live form validation for Laravel Blade templates without requiring Vue, React, Alpine.js, or build tools.

## Features

- ✨ **Zero Build Tools** - Just include a Blade directive
- 🚀 **Laravel Native** - Uses your existing FormRequest classes
- 🎨 **Framework Agnostic** - Auto-detects Bootstrap & Tailwind
- 💪 **Fully Featured** - Debouncing, callbacks, custom styling
- 📦 **Single Package** - One Composer install, everything included
- 🔒 **CSRF Protected** - Automatic token handling

## Installation

### Step 1: Install via Composer

```bash
composer require bladevalidator/bladevalidator
```

### Step 2: Publish Assets

```bash
php artisan vendor:publish --tag=bladevalidator-assets
```

This will copy the JavaScript file to `public/vendor/bladevalidator/`

### Step 3: Add CSRF Exception

**For Laravel 11 & 12** - Add to `bootstrap/app.php`:

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            '/bladevalidator/validate',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

**For Laravel 9 & 10** - Add to `app/Http/Middleware/VerifyCsrfToken.php`:

```php
protected $except = [
    '/bladevalidator/validate',
];
```

> **Note:** The JavaScript automatically sends CSRF tokens. This exception just ensures smooth validation during live field checks.

## Quick Start

### 1. Create a FormRequest

```bash
php artisan make:request StoreUserRequest
```

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3'],
            'email' => ['required', 'email'],
            'password' => ['required', 'min:8'],
        ];
    }
}
```

### 2. Create Your Form

```blade
<!DOCTYPE html>
<html>
<head>
    <title>Registration</title>

    <!-- Include your CSS framework (Bootstrap example) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <form id="registrationForm" action="{{ route('register') }}" method="POST">
        @csrf

        <div class="mb-3">
            <label for="name">Name</label>
            <input type="text" name="name" id="name" class="form-control">
            <div class="invalid-feedback"></div>
        </div>

        <div class="mb-3">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" class="form-control">
            <div class="invalid-feedback"></div>
        </div>

        <div class="mb-3">
            <label for="password">Password</label>
            <input type="password" name="password" id="password" class="form-control">
            <div class="invalid-feedback"></div>
        </div>

        <button type="submit" class="btn btn-primary">Register</button>
    </form>

    <!-- Initialize BladeValidator (JavaScript auto-included!) -->
    @bladeValidator('App\Http\Requests\StoreUserRequest', '#registrationForm')
</body>
</html>
```

**That's it!** No need to manually include `<script>` tags - the directive handles everything automatically.

### 3. Handle Form Submission (Your Controller)

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Models\User;

class UserController extends Controller
{
    public function store(StoreUserRequest $request)
    {
        // The validated() method works as normal!
        $validated = $request->validated();

        User::create($validated);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully!');
    }
}
```

That's it! Your form now has live validation. 🎉

## Configuration Options

### Basic Usage

```blade
@bladeValidator('App\Http\Requests\StoreUserRequest', '#myForm')
```

### With Custom Options

```blade
@bladeValidator('App\Http\Requests\StoreUserRequest', '#myForm', [
    'validateOn' => 'input',           // When to validate: 'blur', 'input', 'change'
    'debounce' => 500,                 // Delay in ms for 'input' validation
    'framework' => 'tailwind',         // Force framework: 'bootstrap', 'tailwind', 'auto'
    'errorClass' => 'border-red-500',  // Custom error class
    'successClass' => 'border-green-500', // Custom success class
])
```

### All Available Options

| Option         | Type   | Default                      | Description                                                    |
| -------------- | ------ | ---------------------------- | -------------------------------------------------------------- |
| `validateOn`   | string | `'blur'`                     | When to trigger validation: `'blur'`, `'input'`, `'change'`    |
| `debounce`     | number | `300`                        | Delay in milliseconds for `'input'` validation                 |
| `framework`    | string | `'auto'`                     | CSS framework: `'bootstrap'`, `'tailwind'`, `'auto'`, `'none'` |
| `errorClass`   | string | auto                         | CSS class for invalid fields                                   |
| `successClass` | string | auto                         | CSS class for valid fields                                     |
| `errorDisplay` | string | `'default'`                  | How to show errors: `'default'`, `'none'`                      |
| `endpoint`     | string | `'/bladevalidator/validate'` | Custom validation endpoint                                     |

## Framework Support

BladeValidator automatically detects and adapts to your CSS framework.

### Bootstrap

```html
<div class="mb-3">
  <input type="text" name="email" class="form-control" />
  <div class="invalid-feedback"></div>
  <!-- Auto-populated -->
</div>
```

**What happens:**

- Adds `is-invalid` class on error
- Adds `is-valid` class on success
- Uses `.invalid-feedback` for error messages

### Tailwind CSS

```html
<div class="mb-4">
  <input type="text" name="email" class="border rounded px-3 py-2" />
  <!-- Error paragraph auto-created with classes: text-red-500 text-sm mt-1 -->
</div>
```

**What happens:**

- Adds `border-red-500` class on error
- Adds `border-green-500` class on success
- Auto-creates `<p class="text-red-500 text-sm mt-1">` for errors

### Custom / No Framework

```html
<div>
  <input type="text" name="email" />
  <div class="error"></div>
</div>
```

**What happens:**

- Adds `error` class on error
- Adds `valid` class on success
- Uses `.error` or `.error-message` for messages

## Advanced Usage

### Custom Error Containers

Use `data-error-target` attribute to specify where errors should display:

```html
<input type="text" name="email" data-error-target="#email-errors" />
<div id="email-errors" class="my-custom-error"></div>
```

### JavaScript API

You can also initialize BladeValidator manually with JavaScript:

```javascript
const validator = BladeValidator.init("#myForm", {
  request: "App\\Http\\Requests\\StoreUserRequest",
  validateOn: "blur",

  // Callbacks
  onSuccess: (field) => {
    console.log(`${field} is valid!`);
  },
  onError: (field, errors) => {
    console.log(`${field} has errors:`, errors);
  },
  onValidate: (field, result) => {
    console.log("Validation complete:", field, result);
  },
});

// Public methods
validator.validateAll(); // Validate all fields
validator.hasErrors(); // Check if form has errors
validator.getErrors("email"); // Get errors for specific field
validator.clearAllErrors(); // Clear all errors
validator.destroy(); // Clean up
```

### Validate Before Submit

```javascript
const form = document.querySelector("#myForm");
const validator = BladeValidator.init("#myForm", {
  request: "App\\Http\\Requests\\StoreUserRequest",
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isValid = await validator.validateAll();

  if (isValid) {
    form.submit(); // Submit if valid
  } else {
    alert("Please fix validation errors");
  }
});
```

### Custom Error Display

Disable automatic error display and handle it yourself:

```blade
@bladeValidator('App\Http\Requests\StoreUserRequest', '#myForm', [
    'errorDisplay' => 'none'
])

<script>
BladeValidator.init('#myForm', {
    request: 'App\\Http\\Requests\\StoreUserRequest',
    errorDisplay: 'none',
    onError: (field, errors) => {
        // Your custom error handling
        Swal.fire({
            icon: 'error',
            title: `Error in ${field}`,
            text: errors[0]
        });
    }
});
</script>
```

## How It Works

1. **Live Validation**: When a user interacts with a field, BladeValidator sends an AJAX request to `/bladevalidator/validate`
2. **Backend Validation**: Laravel validates the field using your FormRequest rules
3. **Visual Feedback**: Errors are displayed instantly, fields are marked as valid/invalid
4. **Form Submission**: When submitted, the form goes through normal Laravel validation via your FormRequest
5. **Your Controller**: Uses `$request->validated()` as usual - no changes needed!

## Platform Support

### Windows

```bash
composer require bladevalidator/bladevalidator
php artisan vendor:publish --tag=bladevalidator-assets
```

### macOS

```bash
composer require bladevalidator/bladevalidator
php artisan vendor:publish --tag=bladevalidator-assets
```

### Linux

```bash
composer require bladevalidator/bladevalidator
php artisan vendor:publish --tag=bladevalidator-assets
```

## Requirements

- PHP 8.0+
- Laravel 9.0+

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any modern browser with ES6 support

## Troubleshooting

### Validation not working?

**1. Check CSRF Token**

Make sure you have the CSRF token in your page:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

Or in your form:

```blade
@csrf
```

**2. Check JavaScript Console**

Open browser DevTools (F12) and check the Console tab for errors.

**3. Verify Route is Registered**

**Windows:**

```powershell
php artisan route:list | findstr bladevalidator
```

**macOS/Linux:**

```bash
php artisan route:list | grep bladevalidator
```

You should see:

```
POST  bladevalidator/validate
```

**4. Clear Caches**

```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

**5. Check FormRequest Rules**

Make sure your FormRequest has a `rules()` method:

```php
public function rules(): array
{
    return [
        'email' => ['required', 'email'],
        'name' => ['required', 'min:3'],
    ];
}
```

### Error: "Request class not found"

Make sure you're using the correct namespace:

```blade
✓ Correct: @bladeValidator('App\Http\Requests\StoreUserRequest', '#myForm')
```

The Blade directive handles escaping automatically.

### Error: "419 Page Expired"

This means CSRF validation is failing. Make sure you added the exception as shown in Step 3 of installation.

### Validation works but errors don't show?

**For Bootstrap:**
Make sure you have an error container:

```html
<input type="text" name="email" class="form-control" />
<div class="invalid-feedback"></div>
<!-- Add this -->
```

**For Tailwind:**
The error message will be auto-created. Just make sure your input has proper styling:

```html
<input type="text" name="email" class="border rounded px-3 py-2" />
<!-- Error paragraph auto-created -->
```

**Custom Error Display:**

```html
<input type="text" name="email" data-error-target="#my-error" />
<div id="my-error"></div>
```

### Multiple forms not working?

Each form needs a unique ID:

```blade
<form id="form1">...</form>
@bladeValidator('RequestClass1', '#form1')

<form id="form2">...</form>
@bladeValidator('RequestClass2', '#form2')
```

### Still having issues?

Open an issue on GitHub with:

- Laravel version (`php artisan --version`)
- PHP version (`php --version`)
- Operating system
- Browser console errors
- Network tab showing the validation request

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Credits

Created by [Shahzaib Daniel](https://github.com/shezy26)

## Support

- 📧 Email: engrsk60@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/shezy26/bladevalidator/issues)
- 📖 Documentation: [GitHub Repository](https://github.com/shezy26/bladevalidator)
