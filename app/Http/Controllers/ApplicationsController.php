<?php

namespace App\Http\Controllers;

use App\Models\ApplicationsModel;
use App\Models\ApplicationTypesModel;
use App\Models\ApplicationFilesModel;
use App\Models\LeaveCreditsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

use Carbon\Carbon;

class ApplicationsController extends Controller
{
    public function checkUser()
    {
        // Log::info("ApplicationsController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getApplications()
    {
        //Log::info("ApplicationsController::getApplications");

        $user = Auth::user();

        if ($this->checkUser()) {
            $clientId = $user->client_id;
            $apps = ApplicationsModel::where('client_id', $clientId)->where('status', 'Pending')->get();

            $applications = [];

            foreach ($apps as $app) {
                $employee = $app->user;
                $type = $app->type;
                $branch = $app->branch;
                $department = $app->department;
                $job_title = $app->jobTitle;

                $applications[] = [
                    'app_id' => $app->id,
                    'app_type_id' => $type->id,
                    'app_type_name' => $type->name,
                    'app_duration_start' => $app->duration_start,
                    'app_duration_end' => $app->duration_end,
                    'app_date_requested' => $app->created_at,
                    'app_description' => $app->description,
                    'app_status' => $app->status,
                    'emp_id' => $app->user_id,
                    'emp_first_name' => $employee->first_name,
                    'emp_middle_name' => $employee->middle_name,
                    'emp_last_name' => $employee->last_name,
                    'emp_suffix' => $employee->suffix,
                    'emp_branch' => $branch->name,
                    'emp_department' => $department->name,
                    'emp_job_title' => $job_title->name
                ];
            }

            return response()->json(['status' => 200, 'applications' => $applications]);
        } else {
            return response()->json(['status' => 200, 'applications' => null]);
        }
    }

    public function getMyApplications()
    {
        //Log::info("ApplicationsController::getApplicationTypes");

        $user = Auth::user();
        $clientId = $user->client_id;
        
        $applications = ApplicationsModel::where('client_id', $clientId)
                                 ->where('user_id', $user->id)
                                 ->get();

        $applications = $applications->map(function($application) {
            $application->attachment = basename($application->attachment);
            return $application;
        });
        
        return response()->json(['status' => 200, 'applications' => $applications]);
        
    }

    public function getDashboardApplications()
    {
        //Log::info("ApplicationsController::getDashboardApplications");

        $user = Auth::user();

        $clientId = $user->client_id;
        $apps = ApplicationsModel::where('client_id', $clientId)
            ->take(10)
            ->get();

        $applications = [];

        foreach ($apps as $app) {
            $employee = $app->user;
            $type = $app->type;

            $applications[] = [
                'app_id' => $app->id,
                'app_type' => $type->name,
                'app_status' => $app->status,
            ];
        }

        return response()->json(['status' => 200, 'applications' => $applications]);

    }

    public function getApplicationTypes()
    {
        //Log::info("ApplicationsController::getApplicationTypes");

        $user = Auth::user();
        $clientId = $user->client_id;

        $types = ApplicationTypesModel::where('client_id', $clientId)
            ->select('id', 'name', 'require_files', 'tenureship_required')
            ->where('deleted_at', NULL)
            ->get();

        return response()->json(['status' => 200, 'types' => $types]);
    }

    public function getTenureship()
    {
        //Log::info("ApplicationsController::getTenureship");

        $user = Auth::user();
        
        $startDate = Carbon::parse($user->date_start);
        
        $currentDate = Carbon::now();
        
        $tenureshipDays = $startDate->diffInDays($currentDate);
        
        return response()->json(['status' => 200, 'tenureship' => $tenureshipDays]);
    }

    public function saveApplication(Request $request)
    {

        //Log::info("ApplicationsController::saveApplication");
        $user = Auth::user();
        Log::info($request);

        try {
            DB::beginTransaction();

            $application = ApplicationsModel::create([
                "type_id" => $request->input('type_id'),
                "duration_start" => $request->input('from_date'),
                "duration_end" => $request->input('to_date'),
                "description" => $request->input('description') ?? "",
                "status" => "Pending",
                "user_id" => $user->id,
                "client_id" => $user->client_id,
            ]);

            $dateTime = now()->format('YmdHis');

            // Adding Files - Documents
            if ($request->hasFile('attachment')) {
                foreach ($request->file('attachment') as $file){
                    $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('applications/employees/attachments', $fileName, 'public');
                    ApplicationFilesModel::create([
                        'application_id' => $application->id,
                        'type' => "Document",
                        'path' => $filePath,
                    ]);
                }
            }

            // Adding Files - Images
            if ($request->hasFile('image')) {
                foreach ($request->file('image') as $index => $file){
                    $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('applications/employees/images', $fileName, 'public');
                    ApplicationFilesModel::create([
                        'application_id' => $application->id,
                        'type' => "Image",
                        'path' => $filePath,
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([ 'status' => 200 ]);

        } catch (\Exception $e) {
            DB::rollBack();

            //Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }
            
    }

    public function editApplication(Request $request)
    {
        //Log::info("ApplicationsController::updateApplication");
        $user = Auth::user();

        try {
            DB::beginTransaction();

            //Application Update
            $application = ApplicationsModel::find($request->input('id'));

            $application->type_id = $request->input('type_id');
            $application->duration_start = $request->input('from_date');
            $application->duration_end = $request->input('to_date');
            $application->description = $request->input('description');
            $application->save();

            // Remove Files
            $deleteFiles = array_merge($request->input('deleteImages'),$request->input('deleteAttachments'));
            ApplicationFilesModel::whereIn('id', $deleteFiles)->delete();

            $dateTime = now()->format('YmdHis');

            // Adding Files - Documents
            if ($request->hasFile('attachment')) {
                foreach ($request->file('attachment') as $file){
                    $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('applications/employees/attachments', $fileName, 'public');
                    ApplicationFilesModel::create([
                        'application_id' => $application->id,
                        'type' => "Document",
                        'path' => $filePath,
                    ]);
                }
            }

            // Adding Files - Images
            if ($request->hasFile('image')) {
                foreach ($request->file('image') as $index => $file){
                    $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('applications/employees/images', $fileName, 'public');
                    ApplicationFilesModel::create([
                        'application_id' => $application->id,
                        'type' => "Image",
                        'path' => $filePath,
                    ]);
                }
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }

        /*
        $application = ApplicationsModel::find($request->input('app_id'));

        $application->type_id = $request->input('type_id');
        $application->duration_start = $request->input('from_date');
        $application->duration_end = $request->input('to_date');
        $application->description = $request->input('description');

        if ($request ->hasFile('attachment')) {
            $file = $request->file('attachment');
            $dateTime = now()->format('YmdHis');
            $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('applications/employees', $fileName, 'public');
            $application->attachment = $filePath;
        }

        $application->save();

        return response()->json(['status' => 200, 'message' => 'Application Updated!', 'application' => $application], 200);
        */
    }

    public function cancelApplication($id)
    {   
        //Log::info("ApplicationsController::cancelApplication");

        $application = ApplicationsModel::find($id);

        if (!$application) {
            //Log::error('Application not found for ID: ' . $id);
            return response()->json(['status' => 404, 'message' => 'Application not found'], 404);
        }

        if ($application->status !== 'Pending') {
            //Log::warning('Application ' . $id . ' cannot be cancelled.');
            return response()->json(['status' => 400, 'message' => 'Only pending applications can be cancelled'], 400);
        }

        $application->status = 'Cancelled';
        $application->save();

        return response()->json(['status' => 200, 'message' => 'Application Cancelling Successful!'], 200);
    }

    public function manageApplication(Request $request)
    {   
        //Log::info("ApplicationsController::manageApplication");
        $user = Auth::user();

        if ($this->checkUser()) {
            //Application Acceptance
            $application = ApplicationsModel::find($request->input('app_id'));

            if (!$application) {
                //Log::error('Application not found for ID: ' . $id);
                return response()->json(['status' => 404, 'message' => 'Application not found'], 404);
            }

            $startDate = Carbon::parse($request->input('app_start_date'));
            $endDate = Carbon::parse($request->input('app_end_date'));
            $empId = $request->input('app_emp_id');
            $appTypeId = $request->input('app_type_id');

            switch($request->input('app_response')) {
                case 'Approve':
                    $this->deductLeaveCredits($startDate, $endDate, $empId, $appTypeId);
                    $application->status = "Approved";
                    $message = "Application Approved";
                    break;
                case 'Decline':
                    $application->status = "Declined";
                    $message = "Application Declined";
                    break;
            }
            $application->save();
            
            return response()->json(['status' => 200, 'message' => $message], 200);
        } else {
            return response()->json(['status' => 200, 'message' => null], 200);
        }

    }

    public function getApplicationFiles($id)
    {
        //Log::info("AnnouncementsController::getFileNames");
        $user = Auth::user();
        
        $files = ApplicationFilesModel::where('application_id', $id)
                ->select('id', 'path', 'type')
                ->get();

                $filenames = [];
                foreach($files as $file){
                    $filenames[] = [
                        'id' => $file->id,
                        'filename' => basename($file->path),
                        'type' => $file->type
                    ];
                }

            return response()->json([ 'status' => 200, 'filenames' => $filenames ? $filenames : null ]);
        
    }

    public function downloadAttachment($id)
    {
        //Log::info("ApplicationsController::downloadAttachment");
        $file = ApplicationFilesModel::find($id);

        if (!$file) {
            return response()->json(['status' => 404, 'message' => 'Attachment not found'], 404);
        }

        $filePath = storage_path('app/public/' . $file->path);

        if (!file_exists($filePath)) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        $fileName = basename($file->path);

        return response()->download($filePath, $fileName);
    }

    public function getLeaveCredits($id)
    {
        //Log::info("ApplicationsController::getLeaveCredits");

        $user = Auth::user();
        $clientId = $user->client_id;

        $leaves = LeaveCreditsModel::where('client_id', $clientId)
                                 ->where('user_id', $id)
                                 ->get();

        $leaveCredits = [];

        foreach($leaves as $leave) {
            $app_type = $leave->type;

            $leaveCredits[] = [
                'id' => $leave->id,
                'client_id' => $leave->client_id,
                'user_id' => $leave->user_id,
                'app_type_id' => $app_type->id,
                'app_type_name' => $app_type->name,
                'credit_number' => $leave->number,
                'credit_used' => $leave->used,
            ];
        }

        return response()->json(['status' => 200, 'leave_credits' => $leaveCredits]);

    }

    public function saveLeaveCredits(Request $request)
    {
        //Log::info("ApplicationsController::saveLeaveCredits");
        $user = Auth::user();
        Log::info($request);

        if($this->checkUser()){
            try {
                DB::beginTransaction();
    
                LeaveCreditsModel::create([
                    'client_id' => $user->client_id,
                    'user_id' => $request->input('emp_id'),
                    'application_type_id' => $request->input('app_type_id'),
                    'number' => $request->input('credit_count'),
                    'used' => 0
                ]);
                
                DB::commit();
                
                return response()->json([ 'status' => 200 ]);
    
            } catch (\Exception $e) {
                DB::rollBack();
    
                //Log::error("Error saving: " . $e->getMessage());
    
                throw $e;
            }
        }
    }

    public function editLeaveCredits(Request $request)
    {
        //Log::info("ApplicationsController::editLeaveCredits");
        $user = Auth::user();
        Log::info($request);

        if($this->checkUser()){
            try {
    
                $leaveCredit = LeaveCreditsModel::find($request->input('app_id'));
                $leaveCredit->number  = $request->input('credit_count');
                $leaveCredit->save();
                
                return response()->json([ 'status' => 200 ]);
    
            } catch (\Exception $e) {
                //Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        }
    }

    public function deductLeaveCredits(Carbon $startDate, Carbon $endDate, $empId, $appTypeId)
    {
        if($this->checkUser()){
            $dayCount = $this->getNumberOfDays($startDate, $endDate);

            $numberOfDays = $dayCount['numberOfDays'];
            $numberOfSaturday = $dayCount['numberOfSaturday'];
            $numberOfSunday = $dayCount['numberOfSunday'];
            $numberOfHoliday = $dayCount['numberOfHoliday'];

            $creditCount = $numberOfDays - $numberOfSaturday - $numberOfSunday - $numberOfHoliday;

            $leaveInfo = LeaveCreditsModel::where('user_id', $empId)
                                    ->where('application_type_id', $appTypeId)
                                    ->first();
            $leaveInfo->used = $leaveInfo->used + $creditCount;
            $leaveInfo->save();
        }
    }

    public function getNumberOfDays(Carbon $startDate, Carbon $endDate)
    {
        //Log::info("ApplicationsController::getNumberOfDays");
    
        // Initialize counters
        $numberOfDays = $startDate->diffInDays($endDate) + 1; // Include start and end date
        $numberOfSaturday = 0;
        $numberOfSunday = 0;
        $numberOfHoliday = 0;
    
        // Fetch Philippine holidays from Nager.Date API
        $holidays = $this->getNagerHolidays($startDate->year, $endDate->year);
    
        $currentDate = $startDate->copy();
    
        while ($currentDate <= $endDate) {
            // Check for Saturday or Sunday
            if ($currentDate->isSaturday()) {
                $numberOfSaturday++;
            } elseif ($currentDate->isSunday()) {
                $numberOfSunday++;
            }
    
            // Check if it's a holiday
            $holidayDate = $currentDate->format('Y-m-d'); // Format date as YYYY-MM-DD
            if (in_array($holidayDate, $holidays)) {
                $numberOfHoliday++;
            }
    
            // Move to the next day
            $currentDate->addDay();
        }
    
        // Return the results
        return [
            'numberOfDays' => $numberOfDays,
            'numberOfSaturday' => $numberOfSaturday,
            'numberOfSunday' => $numberOfSunday,
            'numberOfHoliday' => $numberOfHoliday,
        ];
    }

    public function getNagerHolidays($startYear, $endYear)
    {
        //Log::info("ApplicationsController::getNagerHolidays");

        $holidays = [];
        $countryCode = 'PH';
    
        // Fetch holidays for each year in the range
        for ($year = $startYear; $year <= $endYear; $year++) {
            $url = "https://date.nager.at/api/v3/PublicHolidays/{$year}/{$countryCode}";
    
            $response = Http::get($url);
    
            if ($response->successful()) {
                $data = $response->json();
    
                // Log the API response for debugging
                //Log::info("Nager.Date API Response for {$year}: " . json_encode($data));
    
                // Ensure $data is an array before iterating
                if (is_array($data)) {
                    foreach ($data as $holiday) {
                        $holidays[] = Carbon::parse($holiday['date'])->format('Y-m-d');
                    }
                } else {
                    Log::error("Nager.Date API returned invalid data for year {$year}: " . json_encode($data));
                }
            } else {
                Log::error("Failed to fetch holidays from Nager.Date API for year {$year}: " . $response->status());
                Log::error($response->body());
            }
        }
    
        return $holidays;
    }

    public function getGoogleCalendarHolidays(Carbon $startDate, Carbon $endDate)
    {
        //log::info("ApplicationsController::getGoogleCalendarHolidays");

        $apiKey = 'AIzaSyAPJ1Ua6xjhqwbjsucXeUCYYGUnObnJPU8';
        $calendarId = 'en.philippines#holiday@group.v.calendar.google.com';

        // Prepare the API endpoint to fetch holidays within the date range
        $startDateFormatted = $startDate->toIso8601String();
        $endDateFormatted = $endDate->toIso8601String();

        $url = "https://www.googleapis.com/calendar/v3/calendars/{$calendarId}/events";
        $url .= "?key={$apiKey}&timeMin={$startDateFormatted}&timeMax={$endDateFormatted}&singleEvents=true";

        // Make the API request
        $response = Http::get($url);

        if ($response->successful()) {
            $events = $response->json()['items'];
            $holidays = [];

            foreach ($events as $event) {
                // Extract the date of the holiday and add to the holidays array
                $holidayDate = Carbon::parse($event['start']['date'])->format('Y-m-d');
                $holidays[] = $holidayDate;
            }

            return $holidays;
        } else {
            Log::error("Failed to fetch Google Calendar holidays: " . $response->status());
            log::error($response);
            return [];
        }
    }

    public function getFullLeaveDays()
    {
        //Log::info("ApplicationsController::getFullLeaveDays");

        $user = Auth::user();
        
        $department = $user->department;
        $deptId = $department->id;
        $deptLimit = $department->leave_limit;
        
        $date = Carbon::now();

        $applications = ApplicationsModel::whereHas('user', function($query) use ($deptId) {
            $query->where('department_id', $deptId);
        })
        ->whereNotIn('status', ['Cancelled', 'Declined'])
        ->where('duration_start', '>=', $date)
        ->get();

        $dateCounts = [];
        
        // COUNTS APPLICATIONS PER DAY
        foreach ($applications as $application) {
            $startDate = Carbon::parse($application->start_date);
            $endDate = Carbon::parse($application->end_date);
            
            Log::info("Application Start: " . $startDate->toDateString() . ", End: " . $endDate->toDateString());
            
            $currentDate = $startDate;

            // TO FIX: DOES NOT INCREMENT PROPERLY
            while ($currentDate->lte($endDate)) {
                $dateKey = $currentDate->toDateString();
                if (!isset($dateCounts[$dateKey])) {
                    $dateCounts[$dateKey] = 0;
                }
                $dateCounts[$dateKey]++;
                Log::info("Date: " . $dateKey . ", Count: " . $dateCounts[$dateKey]);
                
                Log::info("Before Increment: " . $currentDate->toDateTimeString());
                
                $currentDate->addDay();
                
                Log::info("After Increment: " . $currentDate->toDateTimeString());
            }
        }

        // DISPLAYS ALL UNTIL ABOVE LOOP IS FIXED
        $fullDates = [];
        foreach ($dateCounts as $date => $count) {
            $fullDates[] = [
                'date' => $date,
                'applications_count' => $count
            ];
        }
        // $fullDates = array_keys(array_filter($dateCounts, function($count) use ($deptLimit) {
        //     return $count >= $deptLimit;
        // }));

        Log::info($fullDates);

        return response()->json(['status' => 200, 'fullDates' => $applications]);

    }
}
