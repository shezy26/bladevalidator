<?php

namespace BladeValidator\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Http\FormRequest;

class ValidationController extends Controller
{
    /**
     * Validate a form field using a FormRequest class.
     */
    public function validate(Request $request)
    {
        // Get the FormRequest class name
        $requestClass = $request->input('_request');

        // Get the field to validate (if validating single field)
        $field = $request->input('_field');

        // Basic validation of inputs
        if (!$requestClass) {
            return response()->json([
                'error' => 'Request class is required'
            ], 400);
        }

        // Check if the class exists
        if (!class_exists($requestClass)) {
            return response()->json([
                'error' => 'Request class not found: ' . $requestClass
            ], 400);
        }

        // Check if it's a FormRequest
        if (!is_subclass_of($requestClass, FormRequest::class)) {
            return response()->json([
                'error' => 'Class must extend FormRequest'
            ], 400);
        }

        // Get rules by calling the static rules method or creating a new instance
        // without triggering validation
        $rules = (new $requestClass)->rules();

        // If validating a single field
        if ($field && isset($rules[$field])) {
            $fieldRules = [$field => $rules[$field]];
        } else {
            // Validate all fields
            $fieldRules = $rules;
        }

        // Run validation
        $validator = Validator::make($request->all(), $fieldRules);

        if ($validator->fails()) {
            return response()->json([
                'valid' => false,
                'errors' => $field
                    ? $validator->errors()->get($field)
                    : $validator->errors()->toArray()
            ], 422);
        }

        return response()->json([
            'valid' => true
        ], 200);
    }
}
