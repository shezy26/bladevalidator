<?php

use Illuminate\Support\Facades\Route;
use BladeValidator\Http\Controllers\ValidationController;

Route::post('/bladevalidator/validate', [ValidationController::class, 'validate'])
    ->middleware(['web'])
    ->name('bladevalidator.validate');
