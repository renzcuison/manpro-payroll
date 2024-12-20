<?php

namespace App\Http\Middleware;

use Closure;
use Carbon\Carbon;
use App\Models\PersonalAccessToken;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */

     public function handle(Request $request, Closure $next)
     {
         $token = $request->header('Authorization');
 
         if (!$token) {
             return response()->json(['error' => 'Token not provided'], 401);
         }
 
         // Extract the actual token
         $token = str_replace('Bearer ', '', $token);
         $tokenRecord = PersonalAccessToken::where('token', $token)->first();
 
         if (!$tokenRecord) {
             return response()->json(['error' => 'Invalid token'], 401);
         }
 
         // Check if the token is expired
         $now = Carbon::now();
         $lastUsedAt = Carbon::parse($tokenRecord->last_used_at);
 
         if ($lastUsedAt->diffInHours($now) >= 1) {
             return response()->json(['error' => 'Session expired. Please log in again.'], 401);
         }
 
         // Update last_used_at timestamp
         $tokenRecord->last_used_at = $now;
         $tokenRecord->save();

         log::info("Request");
         log::info($request);
 
         // Attach the user to the request for later use
         $request->user = $tokenRecord->workShift; // Assuming 'workShift' relates to User
 
         return $next($request); // Proceed to the next request
     }
}
