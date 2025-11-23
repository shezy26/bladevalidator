/**
 * BladeValidator.js
 * Live form validation for Laravel Blade templates without build tools
 *
 * @version 1.0.0
 * @author Shahzaib Daniel
 * @license MIT
 */
(function (window) {
  "use strict";

  /**
   * Main BladeValidator class
   * Handles real-time form validation using Laravel FormRequest rules
   */
  class BladeValidator {
    /**
     * Create a new BladeValidator instance
     *
     * @param {string} formSelector - CSS selector for the form element
     * @param {Object} options - Configuration options
     * @param {string} options.request - Laravel FormRequest class name (required)
     * @param {string} options.endpoint - Validation endpoint URL (default: '/bladevalidator/validate')
     * @param {string} options.csrfToken - CSRF token (auto-detected if not provided)
     * @param {string} options.validateOn - When to validate: 'blur', 'input', 'change' (default: 'blur')
     * @param {number} options.debounce - Delay in ms for 'input' validation (default: 300)
     * @param {string} options.framework - CSS framework: 'bootstrap', 'tailwind', 'auto' (default: 'auto')
     * @param {string} options.errorClass - CSS class for invalid fields
     * @param {string} options.successClass - CSS class for valid fields
     * @param {string} options.errorDisplay - How to display errors: 'default', 'custom', 'none'
     * @param {Function} options.onValidate - Callback fired after validation
     * @param {Function} options.onSuccess - Callback fired on successful validation
     * @param {Function} options.onError - Callback fired on validation error
     */
    constructor(formSelector, options = {}) {
      // Find the form element
      this.form = document.querySelector(formSelector);

      if (!this.form) {
        console.error(`BladeValidator: Form not found: ${formSelector}`);
        return;
      }

      // Detect CSS framework if set to auto
      const detectedFramework = this.detectFramework();

      // Configuration with defaults
      this.config = {
        request: options.request || null,
        endpoint: options.endpoint || "/bladevalidator/validate",
        csrfToken: options.csrfToken || this.getCsrfToken(),
        validateOn: options.validateOn || "blur",
        debounce: options.debounce || 300,
        framework: options.framework || "auto",
        errorClass:
          options.errorClass ||
          this.getDefaultErrorClass(options.framework || detectedFramework),
        successClass:
          options.successClass ||
          this.getDefaultSuccessClass(options.framework || detectedFramework),
        errorDisplay: options.errorDisplay || "default",
        onValidate: options.onValidate || null,
        onSuccess: options.onSuccess || null,
        onError: options.onError || null,
      };

      // Internal state
      this.isValidating = false; // Track if validation is in progress
      this.errors = {}; // Store current validation errors
      this.debounceTimers = {}; // Store debounce timers for each field

      // Initialize the validator
      this.init();
    }

    /**
     * Detect which CSS framework is being used
     * Checks for Bootstrap or Tailwind CSS in the document
     *
     * @returns {string} 'bootstrap', 'tailwind', or 'none'
     */
    detectFramework() {
      // Check for Bootstrap classes
      const hasBootstrap =
        document.querySelector(".form-control") ||
        document.querySelector('[class*="bootstrap"]');

      if (hasBootstrap) {
        return "bootstrap";
      }

      // Check for Tailwind classes (look for common utility classes)
      const hasTailwind =
        document.querySelector('[class*="rounded"]') ||
        document.querySelector('[class*="border"]') ||
        document.querySelector('[class*="text-"]');

      if (hasTailwind) {
        return "tailwind";
      }

      return "none";
    }

    /**
     * Get default error class based on framework
     *
     * @param {string} framework - The CSS framework being used
     * @returns {string} Default error class name
     */
    getDefaultErrorClass(framework) {
      const classes = {
        bootstrap: "is-invalid",
        tailwind: "border-red-500",
        none: "error",
      };
      return classes[framework] || classes["none"];
    }

    /**
     * Get default success class based on framework
     *
     * @param {string} framework - The CSS framework being used
     * @returns {string} Default success class name
     */
    getDefaultSuccessClass(framework) {
      const classes = {
        bootstrap: "is-valid",
        tailwind: "border-green-500",
        none: "valid",
      };
      return classes[framework] || classes["none"];
    }

    /**
     * Initialize the validator
     * Validates configuration and attaches event listeners
     */
    init() {
      // Ensure FormRequest class is provided
      if (!this.config.request) {
        console.error("BladeValidator: Request class is required");
        return;
      }

      // Attach validation listeners to form fields
      this.attachEventListeners();
    }

    /**
     * Attach event listeners to all form fields
     * Binds validation events based on the validateOn configuration
     */
    attachEventListeners() {
      // Get all input, select, and textarea elements
      const fields = this.form.querySelectorAll("input, select, textarea");

      fields.forEach((field) => {
        // Skip fields without a name attribute
        if (!field.name) return;

        // Attach appropriate event listener based on configuration
        if (this.config.validateOn === "input") {
          // Validate as user types (with debouncing)
          field.addEventListener("input", (e) => {
            this.handleFieldValidation(e.target);
          });
        } else if (this.config.validateOn === "blur") {
          // Validate when field loses focus
          field.addEventListener("blur", (e) => {
            this.validateField(e.target.name, e.target.value);
          });
        } else if (this.config.validateOn === "change") {
          // Validate when field value changes
          field.addEventListener("change", (e) => {
            this.validateField(e.target.name, e.target.value);
          });
        }
      });
    }

    /**
     * Handle field validation with debouncing
     * Used for 'input' event validation to prevent excessive API calls
     *
     * @param {HTMLElement} field - The input field being validated
     */
    handleFieldValidation(field) {
      const fieldName = field.name;

      // Clear any existing debounce timer for this field
      if (this.debounceTimers[fieldName]) {
        clearTimeout(this.debounceTimers[fieldName]);
      }

      // Set a new timer to validate after the debounce delay
      this.debounceTimers[fieldName] = setTimeout(() => {
        this.validateField(fieldName, field.value);
      }, this.config.debounce);
    }

    /**
     * Validate a single field against Laravel FormRequest rules
     * Sends an AJAX request to the backend validation endpoint
     *
     * @param {string} fieldName - Name of the field to validate
     * @param {string} fieldValue - Current value of the field
     */
    async validateField(fieldName, fieldValue) {
      this.isValidating = true;

      // Gather all form data for context (some rules may depend on other fields)
      const formData = new FormData(this.form);

      // Convert FormData to a plain object
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Add validation metadata
      data._request = this.config.request; // Laravel FormRequest class
      data._field = fieldName; // Field being validated
      data._token = this.config.csrfToken; // CSRF token (though we also send in header)

      try {
        // Send validation request to Laravel backend
        const response = await fetch(this.config.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": this.config.csrfToken,
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        // Handle successful validation (200 OK)
        if (response.ok) {
          this.clearFieldError(fieldName);
          this.markFieldAsValid(fieldName);

          // Fire success callback if provided
          if (this.config.onSuccess) {
            this.config.onSuccess(fieldName);
          }
        }
        // Handle validation failure (422 Unprocessable Entity)
        else if (response.status === 422) {
          const errors = result.errors || ["Validation failed"];
          this.errors[fieldName] = errors;
          this.displayFieldError(fieldName, errors);

          // Fire error callback if provided
          if (this.config.onError) {
            this.config.onError(fieldName, errors);
          }
        }
        // Handle other errors (500, etc.)
        else {
          console.error(
            "BladeValidator: Unexpected response",
            response.status,
            result
          );
        }

        // Fire general validation callback if provided
        if (this.config.onValidate) {
          this.config.onValidate(fieldName, result);
        }
      } catch (error) {
        console.error("BladeValidator: Validation request failed", error);
      } finally {
        this.isValidating = false;
      }
    }

    /**
     * Display validation error for a field
     * Adds error class and shows error message based on framework
     *
     * @param {string} fieldName - Name of the field with error
     * @param {Array} errors - Array of error messages
     */
    displayFieldError(fieldName, errors) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      // Remove success class and add error class
      field.classList.remove(this.config.successClass);
      field.classList.add(this.config.errorClass);

      // If error display is disabled, return early
      if (this.config.errorDisplay === "none") {
        return; // User will handle errors manually via callbacks
      }

      // Find or create error container
      const errorContainer = this.findOrCreateErrorContainer(field);

      if (errorContainer) {
        // Display the first error message
        errorContainer.textContent = errors[0];
        errorContainer.style.display = "block";

        // Add framework-specific error classes to container
        if (
          this.config.framework === "bootstrap" ||
          this.detectFramework() === "bootstrap"
        ) {
          errorContainer.classList.add("invalid-feedback", "d-block");
        } else if (
          this.config.framework === "tailwind" ||
          this.detectFramework() === "tailwind"
        ) {
          errorContainer.classList.add("text-red-500", "text-sm", "mt-1");
        }
      }
    }

    /**
     * Clear validation error for a field
     * Removes error class and hides error message
     *
     * @param {string} fieldName - Name of the field to clear
     */
    clearFieldError(fieldName) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      // Remove error class
      field.classList.remove(this.config.errorClass);

      // Remove error from internal state
      delete this.errors[fieldName];

      // Clear error container
      const errorContainer = this.findErrorContainer(field);
      if (errorContainer) {
        errorContainer.textContent = "";
        errorContainer.style.display = "none";
      }
    }

    /**
     * Mark field as valid (passed validation)
     * Adds success class to provide visual feedback
     *
     * @param {string} fieldName - Name of the valid field
     */
    markFieldAsValid(fieldName) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      // Add success class for visual feedback
      field.classList.add(this.config.successClass);
    }

    /**
     * Find or create an error container for a field
     * Supports multiple patterns: data attribute, Bootstrap, Tailwind, generic
     *
     * @param {HTMLElement} field - The input field
     * @returns {HTMLElement|null} The error container element
     */
    findOrCreateErrorContainer(field) {
      // First, try to find existing container
      let container = this.findErrorContainer(field);
      if (container) return container;

      // If no container exists, create one based on framework
      const framework =
        this.config.framework === "auto"
          ? this.detectFramework()
          : this.config.framework;

      if (framework === "bootstrap") {
        // Create Bootstrap-style error container
        container = document.createElement("div");
        container.className = "invalid-feedback";
        field.parentElement.appendChild(container);
      } else if (framework === "tailwind") {
        // Create Tailwind-style error container
        container = document.createElement("p");
        container.className = "text-red-500 text-sm mt-1";
        field.parentElement.appendChild(container);
      } else {
        // Create generic error container
        container = document.createElement("div");
        container.className = "error-message";
        field.parentElement.appendChild(container);
      }

      return container;
    }

    /**
     * Find existing error container for a field
     * Checks multiple locations in order of specificity
     *
     * @param {HTMLElement} field - The input field
     * @returns {HTMLElement|null} The error container element or null
     */
    findErrorContainer(field) {
      // 1. Check for custom error target (highest priority)
      const customTarget = field.getAttribute("data-error-target");
      if (customTarget) {
        return document.querySelector(customTarget);
      }

      // 2. Look for Bootstrap's .invalid-feedback
      let container = field.parentElement.querySelector(".invalid-feedback");
      if (container) return container;

      // 3. Look for Tailwind-style error (next sibling with text-red class)
      let sibling = field.nextElementSibling;
      if (sibling && sibling.classList.contains("text-red-500")) {
        return sibling;
      }

      // 4. Look for generic .error or .error-message class
      container = field.parentElement.querySelector(".error");
      if (container) return container;

      container = field.parentElement.querySelector(".error-message");
      if (container) return container;

      return null;
    }

    /**
     * Get CSRF token from meta tag or form input
     * Checks meta tag first, then falls back to form input
     *
     * @returns {string} The CSRF token
     */
    getCsrfToken() {
      // Try to get token from meta tag (Laravel convention)
      const metaTag = document.querySelector('meta[name="csrf-token"]');
      if (metaTag) {
        return metaTag.getAttribute("content");
      }

      // Fall back to form input
      const tokenInput = this.form.querySelector('input[name="_token"]');
      if (tokenInput) {
        return tokenInput.value;
      }

      console.warn("BladeValidator: CSRF token not found");
      return "";
    }

    /**
     * Validate all fields in the form
     * Useful for validating before form submission
     *
     * @returns {Promise<boolean>} True if all fields are valid
     */
    async validateAll() {
      const fields = this.form.querySelectorAll("input, select, textarea");
      const promises = [];

      // Validate each field
      fields.forEach((field) => {
        if (field.name) {
          promises.push(this.validateField(field.name, field.value));
        }
      });

      // Wait for all validations to complete
      await Promise.all(promises);

      // Return true if no errors exist
      return !this.hasErrors();
    }

    /**
     * Check if the form has any validation errors
     *
     * @returns {boolean} True if errors exist
     */
    hasErrors() {
      return Object.keys(this.errors).length > 0;
    }

    /**
     * Get validation errors for a specific field
     *
     * @param {string} fieldName - Name of the field
     * @returns {Array} Array of error messages
     */
    getErrors(fieldName) {
      return this.errors[fieldName] || [];
    }

    /**
     * Get all validation errors
     *
     * @returns {Object} Object with field names as keys and error arrays as values
     */
    getAllErrors() {
      return this.errors;
    }

    /**
     * Clear all validation errors and styling
     */
    clearAllErrors() {
      const fields = this.form.querySelectorAll("input, select, textarea");

      fields.forEach((field) => {
        if (field.name) {
          this.clearFieldError(field.name);
          field.classList.remove(this.config.successClass);
        }
      });

      this.errors = {};
    }

    /**
     * Enable validation
     * Re-attaches event listeners
     */
    enable() {
      this.attachEventListeners();
    }

    /**
     * Disable validation
     * Note: This doesn't remove listeners, just a flag for future use
     */
    disable() {
      // Could add logic here to remove event listeners if needed
      this.isValidating = false;
    }

    /**
     * Destroy the validator instance
     * Clears timers and errors
     */
    destroy() {
      // Clear all debounce timers
      Object.values(this.debounceTimers).forEach((timer) =>
        clearTimeout(timer)
      );
      this.debounceTimers = {};

      // Clear all errors and styling
      this.clearAllErrors();
    }
  }

  /**
   * Static initialization method for convenience
   * Allows BladeValidator.init() instead of new BladeValidator()
   *
   * @param {string} formSelector - CSS selector for the form
   * @param {Object} options - Configuration options
   * @returns {BladeValidator} New validator instance
   */
  BladeValidator.init = function (formSelector, options) {
    return new BladeValidator(formSelector, options);
  };

  // Export BladeValidator to global scope
  window.BladeValidator = BladeValidator;
})(window);
