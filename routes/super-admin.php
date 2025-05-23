<?php

use App\Http\Controllers\ClientsController;
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\PackageController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['auth:sanctum']], function () {

    
    Route::get('/super-admin/clients',[ClientsController::class, 'index']);
    Route::get('/super-admin/clients/{id}',[ClientsController::class, 'show']);
    Route::post('/super-admin/clients',[ClientsController::class, 'store']);
    Route::put('/super-admin/clients/{id}',[ClientsController::class, 'update']);
    Route::delete('/super-admin/clients/{id}',[ClientsController::class, 'delete']);

    Route::get('/super-admin/users',[ClientsController::class, 'users']);
        
    Route::get('/super-admin/companies',[ClientsController::class, 'companies']);
    Route::get('/super-admin/companies/{id}',[ClientsController::class, 'show']);
    Route::post('/super-admin/companies',[ClientsController::class, 'storeCompany']);
    Route::put('/super-admin/companies/{id}',[ClientsController::class, 'update']);
    Route::delete('/super-admin/companies/{id}',[ClientsController::class, 'delete']);
    Route::post('/super-admin/companies/{id}/packages/{pkg_id}',[ClientsController::class, 'assignPackageToCompany']);

    Route::get('/super-admin/packages',[PackageController::class, 'index']);
    Route::get('/super-admin/packages/{id}',[PackageController::class, 'show']);
    Route::post('/super-admin/packages',[PackageController::class, 'store']);
    Route::put('/super-admin/packages/{id}',[PackageController::class, 'update']);
    Route::delete('/super-admin/packages/{id}',[PackageController::class, 'destroy']);
    Route::post('/super-admin/packages/{id}/assignFeature',[PackageController::class, 'assignFeature']);

    Route::get('/super-admin/features',[FeatureController::class, 'index']);
    

});