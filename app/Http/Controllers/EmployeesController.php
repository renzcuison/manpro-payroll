<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\BenefitsModel;
use App\Models\PayslipsModel;
use App\Models\BranchesModel;
use App\Models\UserFormsModel;
use App\Models\JobTitlesModel;
use App\Models\WorkGroupsModel;
use App\Models\DepartmentsModel;
use App\Models\ApplicationsModel;
use App\Models\EmployeeRolesModel;
use App\Models\AttendanceLogsModel;
use App\Models\Company;
use App\Models\LoanLimitHistoryModel;

// use App\Models\NewModel;
// use App\Models\NewModel;
// use App\Models\NewModel;
// use App\Models\NewModel;
// use App\Models\NewModel;

use Carbon\Carbon;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use stdClass;

class EmployeesController extends Controller
{
    public function checkUserAdmin()
    {
        // Log::info("EmployeesController::checkUserAdmin");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function checkUserEmployee()
    {
        // Log::info("PayrollController::checkUserEmployee");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Employee') {
                return true;
            }
        }

        return false;
    }

    public function employeeList(Request $request)
    {
        // log::info("EmployeesController::employeeList");

        $employees = UsersModel::where('user_type', 'Employee')->get();

        return response()->json(['status' => 200, 'employees' => $employees]);
    }

    private function enrichEmployeeDetails($employee)
    {
        $employee->name = $employee->last_name . ", " . $employee->first_name . " " . $employee->middle_name;
        $employee->role = "";
        $employee->jobTitle = "";
        $employee->branch = "";
        $employee->department = "";
        $employee->work_group = "";
        $employee->avatar = null;
        $employee->avatar_mime = null;

        // Enrich with actual data
        if ($employee->role_id) {
            $role = EmployeeRolesModel::find($employee->role_id);
            $employee->role = $role ? $role->name  : "";
        }

        if ($employee->branch_id) {
            $branch = BranchesModel::find($employee->branch_id);
            $employee->branch = $branch ? $branch->name  : "";
        }

        if ($employee->job_title_id) {
            $jobTitle = JobTitlesModel::find($employee->job_title_id);
            $employee->jobTitle = $jobTitle ? $jobTitle->name  : "";
        }

        if ($employee->department_id) {
            $department = DepartmentsModel::find($employee->department_id);
            $employee->department = $department ? $department->name : "";
        }

        if ($employee->work_group_id) {
            $work_group = WorkGroupsModel::find($employee->work_group_id);
            $employee->work_group = $work_group ? $work_group->name : "";
        }

        if ($employee->profile_pic && Storage::disk('public')->exists($employee->profile_pic)) {
            $employee->avatar = base64_encode(Storage::disk('public')->get($employee->profile_pic));
            $employee->avatar_mime = mime_content_type(storage_path('app/public/' . $employee->profile_pic));
        } else {
            $employee->avatar = null;
            $employee->avatar_mime = null;
        }

        unset(
            // $employee->id,
            $employee->verify_code,
            $employee->code_expiration,
            $employee->is_verified,
            $employee->client_id,
            // $employee->branch_id,
            // $employee->department_id,
            // $employee->role_id,
            // $employee->job_title_id,
            // $employee->work_group_id
        );

        return $employee;
    }

    public function getEmployees()
    {
        // log::info("EmployeesController::getEmployees");

        if ($this->checkUserAdmin()) {
            $user = Auth::user();
            // $employees = $user->company->users;

            $client = ClientsModel::find($user->client_id);
            $employees = $client->employees;
            // $employees = $user->company->users;

            $client = ClientsModel::find($user->client_id);
            $employees = $client->employees;

           $employees->map(function ($employee) {
                $employee = $this->enrichEmployeeDetails($employee);

                unset(
                    // $employee->id,
                    $employee->verify_code,
                    $employee->code_expiration,
                    $employee->is_verified,
                    $employee->client_id,
                    // $employee->branch_id,
                    // $employee->department_id,
                    // $employee->role_id,
                    // $employee->job_title_id,
                    // $employee->work_group_id
                );

                return $employee;
            });

            return response()->json(['status' => 200, 'employees' => $employees]);
        }

        return response()->json(['status' => 200, 'employees' => null]);
    }

    public function getEmployeeLeaveCredits()
    {
        // log::info("EmployeesController::getEmployeeLeaveCredits");

        if ($this->checkUserAdmin()) {
            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);
            $employees = [];

            foreach ($client->employees as $employee) {
                $employees[] = [
                    'user_name' => $employee->user_name,
                    'name' => $employee->first_name . ", " . $employee->first_name . " " . $employee->middle_name . " " . $employee->suffix,
                    'branch' => $employee->branch->name . " (" . $employee->branch->acronym . ")",
                    'department' => $employee->department->name . " (" . $employee->department->acronym . ")",
                    'total' => $employee->leaveCredits->sum('number'),
                    'used' => $employee->leaveCredits->sum('used'),
                    'remaining' => $employee->leaveCredits->sum('number') - $employee->leaveCredits->sum('used'),
                ];
            }

            return response()->json(['status' => 200, 'employees' => $employees]);
        }

        return response()->json(['status' => 200, 'employees' => null]);
    }

    public function saveEmployee(Request $request)
    {
        // log::info("EmployeesController::saveEmployee");

        $validated = $request->validate([
            'firstName' => 'required',
            'lastName' => 'required',
            'userName' => 'required',
            'emailAddress' => 'required',
            'birthdate' => 'required',
            'password' => 'required',
        ]);

        if ($this->checkUserAdmin() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $password = Hash::make($request->password);

                UsersModel::create([
                    "user_name" => $request->userName,
                    "first_name" => $request->firstName,
                    "middle_name" => $request->middleName,
                    "last_name" => $request->lastName,
                    "suffix" => $request->suffix,
                    "birth_date" => $request->birthdate,

                    "address" => $request->address,
                    "contact_number" => $request->phoneNumber,
                    "email" => $request->emailAddress,
                    "password" => $password,

                    "user_type" => "Employee",
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function saveRegistration(Request $request)
    {
        //log::info("EmployeesController::saveRegistration");
        //log::info($request);

        $validated = $request->validate([
            'firstName' => 'required',
            'lastName' => 'required',
            'userName' => 'required',
            'emailAddress' => 'required',
            'birthdate' => 'required',
            'password' => 'required',
        ]);

        $formLink = UserFormsModel::where('unique_code', $request->input('code'))->first();

        if ($validated && $formLink) {

            $client = ClientsModel::find($formLink->client_id);

            try {
                DB::beginTransaction();

                $password = Hash::make($request->password);

                UsersModel::create([
                    "user_name" => $request->userName,
                    "first_name" => $request->firstName,
                    "middle_name" => $request->middleName,
                    "last_name" => $request->lastName,
                    "suffix" => $request->suffix,
                    "birth_date" => $request->birthdate,

                    "address" => $request->address,
                    "contact_number" => $request->phoneNumber,
                    "email" => $request->emailAddress,
                    "password" => $password,

                    "branch_id" => $formLink->branch_id,
                    "department_id" => $formLink->department_id,

                    "user_type" => "Employee",
                    "client_id" => $client->id,
                ]);

                DB::commit();

                $formLink->used = $formLink->used + 1;
                $formLink->save();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        } else {
            return response()->json(['status' => 400, 'message' => "Invalid Form Data"]);
        }
    }

    public function getEmployeeDetails(Request $request)
    {
        // log::info("EmployeesController::getEmployeeDetails");

        $validated = $request->validate([
            'username' => 'required|string'
        ]);

        if (($this->checkUserAdmin() || $this->checkUserEmployee()) && $validated) {
            $user = Auth::user();
            $employee = UsersModel::where('client_id', $user->client_id)->where('user_name', $request->username)->first();

            $latestLoanLimit = LoanLimitHistoryModel::where('employee_id', $employee->id)->latest('created_at')->first();

            $employee = $this->enrichEmployeeDetails($employee);

            $employee->salary = (float) number_format((float) $employee->salary, 2, '.', '');
            $employee->credit_limit = $latestLoanLimit ? $latestLoanLimit->new_limit : 0;
            $employee->total_payroll = PayslipsModel::where('employee_id', $employee->id)->count();
            $employee->total_attendance = AttendanceLogsModel::where('user_id', $employee->id)->latest('created_at')->count();
            $employee->total_applications = ApplicationsModel::where('client_id', $employee->id)->where('status', 'Approved')->count();

            return response()->json(['status' => 200, 'employee' => $employee]);
        }
    }

    public function getEmployeeShortDetails(Request $request)
    {
        // log::info("EmployeesController::getEmployeeShortDetails");
        $validated = $request->validate([
            'username' => 'required|string'
        ]);
        if (($this->checkUserAdmin() || $this->checkUserEmployee()) && $validated) {
            $user = Auth::user();
            $employee = UsersModel::with('workShift')->where('client_id', $user->client_id)->where('user_name', $request->username)->first();

            $employeeData = new stdClass();

            $employeeData->id = $employee->id;
            $employeeData->first_name = $employee->first_name ?? '';
            $employeeData->middle_name = $employee->middle_name ?? '';
            $employeeData->last_name = $employee->last_name ?? '';
            $employeeData->suffix = $employee->suffix ?? '';

            $workShift = $employee->workShift;
            $employeeData->shift_type = $workShift->shift_type;

            return response()->json(['status' => 200, 'employee' => $employeeData]);
        }
    }

    public function getMyDetails(Request $request)
    {
        // log::info("EmployeesController::getMyDetails");

        $user = Auth::user();
        $employee = UsersModel::find($user->id);

        $employee = $this->enrichEmployeeDetails($employee);

        $employee->total_payroll = PayslipsModel::where('employee_id', $employee->id)->count();
        $employee->total_attendance = AttendanceLogsModel::where('user_id', $employee->id)->latest('created_at')->count();
        $employee->total_applications = ApplicationsModel::where('client_id', $employee->id)->where('status', 'Approved')->count();

        return response()->json(['status' => 200, 'employee' => $employee]);
    }

    public function getMyPayrollHistory(Request $request)
    {
        // log::info("EmployeesController::getMyPayrollHistory");
        // log::info($request);

        if ($this->checkUserAdmin()) {
            $user = Auth::user();

            $employee = UsersModel::where('client_id', $user->client_id)->where('user_name', $request->username)->first();
            $rawRecords = PayslipsModel::where('employee_id', $employee->id)->where('client_id', $user->client_id)->get();

            $records = [];

            foreach ($rawRecords as $rawRecord) {
                $employee = UsersModel::find($rawRecord->employee_id);

                $records[] = [
                    'record' => encrypt($rawRecord->id),
                    'payrollStartDate' => $rawRecord->period_start ?? '-',
                    'payrollEndDate' => $rawRecord->period_end ?? '-',
                    'payrollCutOff' => $rawRecord->cut_off ?? '-',
                    'payrollWorkingDays' => $rawRecord->working_days ?? '-',
                    'payrollGrossPay' => $rawRecord->rate_monthly ?? '-',
                    'payrollEarnings' => $rawRecord->total_earnings ?? '-',
                    'payrollDeductions' => $rawRecord->total_deductions ?? '-',
                ];
            }

            return response()->json(['status' => 200, 'records' => $records]);
        }

        return response()->json(['status' => 200, 'records' => null]);
    }

    public function getMyAvatar()
    {
        //log::info("EmployeesController::getMyAvatar");
        $user = Auth::user();

        $avatar = [
            'image' => null,
            'mime' => null
        ];

        if ($user->profile_pic && Storage::disk('public')->exists($user->profile_pic)) {
            $avatar['image'] = base64_encode(Storage::disk('public')->get($user->profile_pic));
            $avatar['mime'] = mime_content_type(storage_path('app/public/' . $user->profile_pic));
        }

        return response()->json(['status' => 200, 'avatar' => $avatar]);
    }

    public function editMyProfile(Request $request)
    {
        //log::info("EmployeesController::editMyProfile");
        //log::info($request);

        $user = UsersModel::findOrFail($request->input('id'));

        try {

            $user->first_name = $request->input('first_name');
            $user->middle_name = $request->input('middle_name');
            $user->last_name = $request->input('last_name');
            $user->suffix = $request->input('suffix');

            $user->birth_date = $request->input('birth_date');
            $user->gender = $request->input('gender');

            $user->contact_number = $request->input('contact_number');
            $user->address = $request->input('address');

            // Save profile pic using spatie media library
            if ($request->hasFile('profile_pic')) {
                
			    $user->clearMediaCollection('profile_pic');
                $user->addMediaFromRequest('profile_pic')->toMediaCollection('profile_pic');
            }
            
            if($request->has('employee_educations')){
                $user->educations()->delete();

                foreach($request->input('employee_educations') as $education){
                    $user->educations()->create([
                        'school_name' => $education['school_name'],
                        'degree_name' => $education['degree_name'],
                        'degree_type' => $education['degree_type'],
                        'year_graduated' => $education['year_graduated'],
                    ]);
                }
            }

            $user->save();

            return response()->json([
                'user' => $user->load('media'),
                'status' => 200
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }
    }

    public function editEmployeeDetails(Request $request)
    {
        // log::info("EmployeesController::editEmployeeDetails");

        $user = Auth::user();
        $employee = UsersModel::where('user_name', $request->userName)->first();

        if ($this->checkUserAdmin() && $user->client_id == $employee->client_id) {

            try {
                DB::beginTransaction();

                $employee->first_name = $request->firstName;
                $employee->middle_name = $request->middleName;
                $employee->last_name = $request->lastName;
                $employee->suffix = $request->suffix;
                $employee->birth_date = $request->birthdate;
                $employee->email = $request->emailAddress;
                $employee->contact_number = $request->phoneNumber;
                $employee->address = $request->address;

                $employee->salary = $request->salary;
                $employee->salary_type = $request->salaryType;

                $employee->tin_number = $request->tinNumber;
                $employee->deduct_tax = $request->taxStatus;

                $employee->role_id = $request->selectedRole;
                $employee->branch_id = $request->selectedBranch;
                $employee->job_title_id = $request->selectedJobTitle;
                $employee->department_id = $request->selectedDepartment;
                $employee->work_group_id = $request->selectedWorkGroup;

                $employee->employment_type = $request->selectedType;
                $employee->employment_status = $request->selectedStatus;
                $employee->date_start = $request->startDate;
                $employee->date_end = $request->endDate;
                $employee->save();

                $existingLoanLimit = LoanLimitHistoryModel::where('employee_id', $employee->id)->latest('created_at')->first();

                if ($existingLoanLimit && ($existingLoanLimit->new_limit != $request->creditLimit)) {
                    LoanLimitHistoryModel::create([
                        "employee_id" => $employee->id,
                        "old_limit" => $existingLoanLimit->new_limit,
                        "new_limit" => $request->creditLimit,
                        "user_id" => $user->id,
                    ]);
                }

                if (!$existingLoanLimit && $request->creditLimit != 0) {
                    LoanLimitHistoryModel::create([
                        "employee_id" => $employee->id,
                        "old_limit" => 0,
                        "new_limit" => $request->creditLimit,
                        "user_id" => $user->id,
                    ]);
                }

                // Taxes

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function getFormLinks()
    {
        // log::info("EmployeesController::getFormLinks");
        $user = Auth::user();

        if ($this->checkUserAdmin()) {

            $formLinks = [];
            $rawFormLinks = UserFormsModel::where('client_id', $user->client_id)->orderBy('created_at', 'desc')->get();

            foreach ($rawFormLinks as $rawFormLink) {

                if ( $rawFormLink->used <= $rawFormLink->limit ) {
                    $rawFormLink->status = "Used";
                    $rawFormLink->save();
                }

                if (now()->greaterThan($rawFormLink->expiration)) {
                    $rawFormLink->status = 'Expired';
                }

                $formLinks[] = [
                    'code' => $rawFormLink->unique_code,
                    'limit' => $rawFormLink->limit,
                    'used' => $rawFormLink->used,
                    'expiration' => $rawFormLink->expiration,
                    'status' => $rawFormLink->status,
                    'branch' => $rawFormLink->branch->name ?? '-',
                    'department' => $rawFormLink->department->name ?? '-',
                ];
            }

            return response()->json(['status' => 200, 'form_links' => $formLinks]);
        }
    }

    public function saveFormLink(Request $request)
    {
        // log::info("EmployeesController::saveFormLink");
        $user = Auth::user();

        if ($this->checkUserAdmin()) {

            try {
                DB::beginTransaction();

                $uniqueCode = $this->generateRandomCode(16);
                while (UserFormsModel::where('unique_code', $uniqueCode)->exists()) {
                    $uniqueCode = $this->generateRandomCode(16);
                    //Log::info("Regenerating code: " . $uniqueCode);
                }

                UserFormsModel::create([
                    "client_id" => $user->client_id,
                    "unique_code" => $uniqueCode,
                    "limit" => $request->input('use_limit'),
                    "expiration" => $request->input('expiry_date'),
                    "branch_id" => $request->input('branch'),
                    "department_id" => $request->input('department'),
                    "created_by" => $user->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function deleteFormLink(Request $request)
    {
        // log::info("EmployeesController::deleteFormLink");
        $user = Auth::user();
        Log::info($request);

        if ($this->checkUserAdmin()) {

            try {
                DB::beginTransaction();

                UserFormsModel::where('id', $request->input('id'))->update(['deleted_by' => $user->id]);
                UserFormsModel::where('id', $request->input('id'))->delete();

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }
    
    public function getFormLinkStatus(Request $request)
    {
        // Log::info("EmployeesController::getFormLinkStatus");

        $code = $request->query('code');

        $formLink = UserFormsModel::where('unique_code', $code)->first();

        if (!$formLink) {
            return response()->json(['status' => 404, 'form_status' => 'Absent']);
        }

        if ($formLink->used >= $formLink->limit) {
            $formLink->status = "Used";
            $formLink->save();
        }

        if (now()->greaterThan($formLink->expiration)) {
            $formLink->status = "Expired";
            $formLink->save();
        }

        return response()->json(['status' => 200, 'form_status' => $formLink->status]);
    }

    function generateRandomCode($length)
    {
        // log::info("EmployeesController::generateRandomCode");
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $result = '';
        $charsLength = strlen($chars);

        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[rand(0, $charsLength - 1)];
        }

        return $result;
    }
}