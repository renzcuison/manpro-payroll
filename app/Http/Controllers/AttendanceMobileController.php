<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLogsMobileModel;
use App\Models\AttendanceLogsModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AttendanceMobileController extends Controller
{
    public function saveMobileEmployeeAttendance(Request $request)
    {
        try {
            // Log incoming request data
            Log::info('saveMobileEmployeeAttendance Request:', [
                'action' => $request->action,
                'biometric_signature' => $request->biometric_signature,
                'payload' => $request->payload,
                'has_image' => $request->hasFile('image')
            ]);

            $user = Auth::user();
            if (!$user) {
                Log::warning('No authenticated user found');
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Validate request
            $request->validate([
                'action' => 'required|string|in:Duty In,Duty Out,Overtime In,Overtime Out',
                'biometric_signature' => 'nullable|string',
                'payload' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png|max:2048',
            ]);

            // Check if either biometric or image is provided
            if (!$request->biometric_signature && !$request->hasFile('image')) {
                Log::warning('Neither biometric_signature nor image provided');
                return response()->json(['error' => 'Biometric signature or image required'], 422);
            }

            // Check work shift
            if (!$user->workShift || !isset($user->workShift->work_hour_id)) {
                Log::warning('Employee work shift not configured for user ID: ' . $user->id);
                return response()->json(['error' => 'Employee work shift not configured'], 400);
            }

            // Determine method (1 for mobile, 2 for biometric)
            $method = $request->biometric_signature ? 2 : 1;

            // Create attendance log
            $attendance = AttendanceLogsModel::create([
                'user_id' => $user->id,
                'work_hour_id' => $user->workShift->work_hour_id,
                'action' => $request->action,
                'method' => $method,
                'timestamp' => now(),
            ]);

            // Prepare mobile log data
            $mobileLogData = [
                'attendance_id' => $attendance->id,
                'biometric_signature' => $request->biometric_signature,
                'payload' => $request->payload,
                'path' => null,
            ];

            // Handle image upload if provided
            if ($request->hasFile('image')) {
                try {
                    $path = $request->file('image')->store('attendance_images', 'public');
                    $mobileLogData['path'] = $path;
                    Log::info('Image uploaded successfully', ['path' => $path]);
                } catch (\Exception $e) {
                    Log::error('Failed to upload image: ' . $e->getMessage());
                    return response()->json(['error' => 'Failed to upload image'], 500);
                }
            }

            // Create mobile log
            $mobileLog = AttendanceLogsMobileModel::create($mobileLogData);
            Log::info('Mobile log created', ['attendance_id' => $attendance->id]);

            return response()->json([
                'message' => 'Attendance recorded successfully',
                'attendance' => [
                    'id' => $attendance->id,
                    'action' => $attendance->action,
                    'timestamp' => $attendance->timestamp,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error saving mobile attendance: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Server error occurred'], 500);
        }
    }
}