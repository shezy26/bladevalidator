# BladeValidator

Live form validation for Laravel Blade templates without requiring Vue, React, Alpine.js, or build tools.

## Features

- ✨ **Zero Build Tools** - Just include a `<script>` tag
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

### Step 3: (Optional) Exclude CSRF for Validation Endpoint

Add to `bootstrap/app.php`:

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            '/bladevalidator/validate',
        ]);
    })
    // ... rest of config
```

> **Note:** In production, the JavaScript automatically sends the CSRF token, but excluding the endpoint prevents issues during development.

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

    <!-- Include BladeValidator -->
    <script src="{{ asset('vendor/bladevalidator/bladevalidator.min.js') }}"></script>

    <!-- Initialize with Blade Directive -->
    @bladeValidator('App\Http\Requests\StoreUserRequest', '#registrationForm')
</body>
</html>
```

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
  <!-- Error paragraph auto-created -->
</div>
```

**What happens:**

- Adds `border-red-500` class on error
- Adds `border-green-500` class on success
- Creates `<p class="text-red-500 text-sm mt-1">` for errors

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

## Requirements

- PHP 8.0+
- Laravel 9.0+

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any modern browser with ES6 support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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

```bash
php artisan route:list | findstr bladevalidator
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

Make sure you're using the correct namespace with double backslashes:

```blade
✗ Wrong: @bladeValidator('App\Http\Requests\StoreUserRequest', '#myForm')
✓ Correct: @bladeValidator('App\Http\Requests\StoreUserRequest', '#myForm')
```

Note: In Blade, single backslashes work fine. The directive handles escaping automatically.

### Error: "419 Page Expired"

This means CSRF validation is failing. Add the exception in `bootstrap/app.php`:

```php
$middleware->validateCsrfTokens(except: [
    '/bladevalidator/validate',
]);
```

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
- Browser console errors
- Network tab showing the validation request

```

---

## Step 9: Create a License File

**Create: `bladevalidator/LICENSE`**
```

MIT License

Copyright (c) 2025 Shahzaib Daniel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

---

## Final Package Structure

Your package should now look like this:
```

bladevalidator/
├── src/
│ ├── BladeValidatorServiceProvider.php
│ ├── BladeDirective.php
│ └── Http/
│ └── Controllers/
│ └── ValidationController.php
├── resources/
│ └── js/
│ ├── bladevalidator.js
│ └── bladevalidator.min.js
├── routes/
│ └── web.php
├── composer.json
├── README.md
├── CHANGELOG.md
├── LICENSE
└── minify.php

## License

MIT License - see LICENSE file for details

## Credits

Created by Shahzaib Daniel

## Support

- 📧 Email: engrsk60@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/bladevalidator/issues)
- 📖 Docs: [Full Documentation](https://github.com/yourusername/bladevalidator)
