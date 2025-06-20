<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\AttendanceSummary;
use App\Models\AttendanceLogsModel;
use App\Models\ApplicationsOvertimeModel;
use App\Models\AttendanceLogsMobileModel;
use App\Models\WorkHoursModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

use Carbon\Carbon;

class AttendanceMobileController extends Controller
{
    public function saveMobileEmployeeAttendance(Request $request)
    {
        try {
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

            if (!$request->biometric_signature && !$request->hasFile('image')) {
                Log::warning('Neither biometric_signature nor image provided');
                return response()->json(['error' => 'Biometric signature or image required'], 422);
            }

            if (!$user->workShift || !isset($user->workShift->work_hour_id)) {
                Log::warning('Employee work shift not configured for user ID: ' . $user->id);
                return response()->json(['error' => 'Employee work shift not configured'], 400);
            }

            DB::beginTransaction();

            $workHour = WorkHoursModel::find($user->workShift->work_hour_id);
            $method = $request->biometric_signature ? 3 : 2;

            // Create attendance log
            $attendance = AttendanceLogsModel::create([
                'user_id' => $user->id,
                'work_hour_id' => $workHour->id,
                'action' => $request->action,
                'method' => $method,
                'timestamp' => now(),
            ]);

            // Save attendance summary
            $this->saveAttendanceSummary($user, $workHour, $attendance);

            // Prepare mobile log data
            $mobileLogData = [
                'attendance_id' => $attendance->id,
                'biometric_signature' => $request->biometric_signature,
                'payload' => $request->payload,
                'path' => null,
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                try {
                    $path = $request->file('image')->store('attendance_images', 'public');
                    $mobileLogData['path'] = $path;
                    Log::info('Image uploaded successfully', ['path' => $path]);
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Failed to upload image: ' . $e->getMessage());
                    return response()->json(['error' => 'Failed to upload image'], 500);
                }
            }

            // Save mobile log
            AttendanceLogsMobileModel::create($mobileLogData);
            Log::info('Mobile log created', ['attendance_id' => $attendance->id]);

            DB::commit();

            return response()->json([
                'message' => 'Attendance recorded successfully',
                'attendance' => [
                    'id' => $attendance->id,
                    'action' => $attendance->action,
                    'timestamp' => $attendance->timestamp,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving mobile attendance: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Server error occurred'], 500);
        }
    }

    public function saveAttendanceSummary($user, $workHour, $attendanceLog)
    {
        $timestamp = $attendanceLog->timestamp;
        $day = Carbon::parse($timestamp)->toDateString();
        $dayStart = Carbon::parse("$day {$workHour->first_time_in}");

        $dayEnd = $workHour->shift_type === 'Regular'? Carbon::parse("$day {$workHour->first_time_out}"): Carbon::parse("$day {$workHour->second_time_out}");

        $summary = AttendanceSummary::where('user_id', $user->id)->where('work_day_start', $dayStart)->where('work_day_end', $dayEnd)->first();

        if (!$summary) {
            $summary = AttendanceSummary::create([
                "user_id" => $user->id,
                "client_id" => $user->client_id,
                "work_hour_id" => $workHour->id,
                "work_day_start" => $dayStart,
                "work_day_end" => $dayEnd,
                "day_type" => ($timestamp >= Carbon::parse($timestamp)->startOfWeek()->addDays(6)->toDateString()) ? 'Rest Day' : 'Regular Day',
                "minutes_late" => 0,
                "latest_log_id" => $attendanceLog->id,
            ]);
        } else {
            $summary->latest_log_id = $attendanceLog->id;
            $summary->save();
        }

        $attendanceLog->attendance_summary_id = $summary->id;
        $attendanceLog->save();

        return $summary;
    }
}