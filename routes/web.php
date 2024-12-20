<?php

use App\Models\Post;
use App\Http\Controllers\UsersController;
use App\Mail\ReferralMail;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
// 	return view("welcome");
// });

Route::view('/{path?}', 'app')->where('path', '.*');

Route::get('/hr/dashboard', function () {
	return view("HumanResource/dashboard");
});

Route::get('/accounting/dashboard', function () {
	return view("Accounting/dashboard");
});

