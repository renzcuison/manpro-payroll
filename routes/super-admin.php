<?php

use App\Http\Controllers\FeatureController;
use App\Http\Controllers\PackageController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('/super-admin/packages',[PackageController::class, 'index']);
    Route::get('/super-admin/packages/{id}',[PackageController::class, 'show']);
    Route::post('/super-admin/packages',[PackageController::class, 'store']);
    Route::put('/super-admin/packages/{id}',[PackageController::class, 'update']);
    Route::delete('/super-admin/packages/{id}',[PackageController::class, 'destroy']);
    Route::post('/super-admin/packages/{id}/assignFeature',[PackageController::class, 'assignFeature']);

    Route::get('/super-admin/features',[FeatureController::class, 'index']);

});