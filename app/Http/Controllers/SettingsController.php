<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\BranchesModel;
use App\Models\JobTitlesModel;
use App\Models\DepartmentsModel;
use App\Models\DepartmentPosition;
use App\Models\DepartmentPositionAssignment;
use App\Models\EmployeeDepartmentPosition;
use App\Models\EmployeeRolesModel;
use App\Models\ApplicationTypesModel;
use App\Models\BranchPosition;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function checkUser()
    {
        // Log::info("SettingsController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }
        return false;
    }



public function getBranches(Request $request)
{
    if ($this->checkUser()) {
        $user = Auth::user();
        $branches = BranchesModel::where('client_id', $user->client_id)
            ->with(['manager', 'supervisor', 'approver'])
            ->withCount('employees')
            ->get();

        return response()->json(['status' => 200, 'branches' => $branches]);
    }

    return response()->json(['status' => 200, 'branches' => null]);
}

public function getBranch($id)
{
    if ($this->checkUser()) {
        $branch = BranchesModel::with(['manager', 'supervisor', 'approver', 'employees'])->findOrFail($id);
        $rawEmployees = $branch->employees;

        $employees = [];

        foreach($rawEmployees as $rawEmployee) {
            $employees[] = [
                'id' => $rawEmployee->id, // Make sure to include employee ID
                'name' => $rawEmployee->last_name . ", " . $rawEmployee->first_name . " " . $rawEmployee->middle_name . " " . $rawEmployee->suffix,
                'department' => $rawEmployee->department->name,
            ];  
        }

        return response()->json([
            'status' => 200,
            'branch' => $branch,
            'employees' => $employees, 
            'employeesCount' => $branch->employees->count()
        ]);
    }

    return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
}


public function getBranchPositionAssignments($branchId)
{
    try {
        $assignments = UsersModel::where('branch_id', $branchId)
            ->whereNotNull('branch_position_id')
            ->with(['position'])
            ->get()
            ->map(function($user) {
                return [
                    'branch_id' => $user->branch_id,
                    'branch_position_id' => $user->branch_position_id,
                    'employee_id' => $user->id,
                    'employee' => $user->only(['id', 'first_name', 'last_name']),
                    'position' => $user->position->only(['id', 'name'])
                ];
            });

        return response()->json([
            'success' => true,
            'assignments' => $assignments
        ]);
    } catch (\Exception $e) {
        Log::error('Error fetching branch position assignments:', [
            'error' => $e->getMessage(),
            'branch_id' => $branchId
        ]);
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

public function updateBranchPositionAssignments(Request $request, $branchId)
{
    $validated = $request->validate([
        'branch_position_id' => 'required|exists:branch_positions,id',
        'employee_ids' => 'required|array',
        'employee_ids.*' => 'nullable|exists:users,id',
    ]);

    try {
        // First clear all assignments for this position in this branch
        UsersModel::where('branch_id', $branchId)
            ->where('branch_position_id', $validated['branch_position_id'])
            ->update(['branch_position_id' => null]);

        // Assign new employees to this position
        foreach ($validated['employee_ids'] as $employeeId) {
            if ($employeeId) {
                UsersModel::where('id', $employeeId)
                    ->update([
                        'branch_id' => $branchId,
                        'branch_position_id' => $validated['branch_position_id']
                    ]);
            }
        }

        return response()->json([
            'status' => 200,
            'message' => 'Position assignments updated successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 500,
            'message' => 'Error updating assignments: ' . $e->getMessage()
        ], 500);
    }
}



    public function saveBranch(Request $request)
    {
        // log::info("SettingsController::saveBranch");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $branch = BranchesModel::create([
                    "name" => $request->name,
                    "acronym" => $request->acronym,
                    "address" => $request->address,
                    "status" => "Active",
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'branch' => $branch]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function editBranch(Request $request)
    {
        log::info("SettingsController::editBranch");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
            'status' => 'required',
            'manager_id' => 'nullable|exists:users,id',
            'supervisor_id' => 'nullable|exists:users,id',
            'approver_id' => 'nullable|exists:users,id',
            'leave_limit' => 'required|integer|min:0'
        ]);

        if ($this->checkUser() && $validated) {
        try {
            DB::beginTransaction();

            $branch = BranchesModel::findOrFail($request->id);
            
            $branch->update([
                'name' => $request->name,
                'acronym' => $request->acronym,
                'description' => $request->description,
                'status' => $request->status,
                'manager_id' => $request->manager_id,
                'supervisor_id' => $request->supervisor_id,
                'approver_id' => $request->approver_id,
                'leave_limit' => $request->leave_limit
            ]);

            DB::commit();

            // Return the updated branch with personnel names
            $updatedBranch = BranchesModel::with(['manager', 'supervisor', 'approver'])
                ->find($request->id);
  
                
            return response()->json([
                'status' => 200,
                'branch' => $updatedBranch,
                'message' => 'Branch updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating Branch: " . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => 'Error updating branch'
            ], 500);
        }
    }

    return response()->json([
        'status' => 403,
        'message' => 'Unauthorized'
    ], 403);
}

    public function saveBranchPosition(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'id' => 'nullable|exists:branch_positions,id',
            'name' => 'required|string|max:255',
            'can_review_request' => 'required|boolean',
            'can_approve_request' => 'required|boolean',
            'can_note_request' => 'required|boolean',
            'can_accept_request' => 'required|boolean',
        ]);

        // Update if ID is provided, otherwise create new
        $position = BranchPosition::updateOrCreate(
            ['id' => $request->id, 'client_id' => $user->client_id],
            array_merge($validated, ['client_id' => $user->client_id])
        );

        return response()->json([
            'status' => 200,
            'message' => $request->id ? 'Position updated' : 'Position created',
            'position' => $position
        ]);
    }

    public function deleteBranchPosition($id)
    {
        $user = Auth::user();

        $position = BranchPosition::where('client_id', $user->client_id)->findOrFail($id);
        $position->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Branch position deleted'
        ]);
    }

    public function getDepartments(Request $request)
    {
        if ($this->checkUser()) {
            $user = Auth::user();
            $departments = DepartmentsModel::where('client_id', $user->client_id)
            ->get();
     
            return response()->json(['status' => 200, 'departments' => $departments]);
        }
     
        return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
    }

    //get only the information of one specific department
    public function getDepartment($departmentId)
    {
        if (!$this->checkUser()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
        $user = Auth::user();
        $department = DepartmentsModel::where('id', $departmentId)
        ->where('client_id', $user->client_id)
        ->first();

        if (!$department) {
            return response()->json(['status' => 404, 'message' => 'Department not found'], 404);
        }
        return response()->json(['status' => 200, 'department' => $department]);
    }
     

    //get all departments
    public function getAllDepartments(){
        if(!$this->checkUser()){
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
        $departments = DepartmentsModel::all();
        return response()->json(['status' => 200, 'data' => $departments]);
    }

    //get department positions
    public function getDepartmentPositions(){
        if(!$this->checkUser()){
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
        $user = Auth::user();
        
        $positions = DepartmentPosition::where('client_id', $user->client_id)
        ->orderBy('name')
        ->get();

        return response()->json(['status' => 200, 'positions' => $positions]);
    }

    //get assigned employees in a specific department
    public function getEmployeesByDepartment($departmentId)
    {
        if (!$this->checkUser()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
        $user = Auth::user();

        //gets employees that are assigned in this department and have assigned positions
        $assigned = UsersModel::with(['departmentPosition'])
        ->where('client_id', $user->client_id)
        ->where('department_id', $departmentId)
        ->whereNotNull('department_position_id')
        ->get();

        //gets employees that does not belong to any departments yet, and those that are in this department but not assigned to a position
        $unassigned = UsersModel::where('client_id', $user->client_id)
        ->where('user_type', 'Employee')
        ->where(function ($q) use ($departmentId) {
            $q->whereNull('department_id')
            ->orWhere(function ($q2) use ($departmentId) {
                $q2->where('department_id', $departmentId)
                    ->whereNull('department_position_id');
            });
        })
        ->get();
        return response()->json([
            'status' => 200,
            'assigned' => $assigned,
            'unassigned' => $unassigned,
        ]);
    }

    public function getUsers(Request $request)
    {
        // inputs:
        /*
            department_id?: number,
            branch_id?: number,
            user_type: 'Admin' | 'Employee' | 'AdminOrEmployee'
        */

        // returns:
        /*
            users: {
                id, user_name, last_name, first_name, middle_name, suffix
            }
        */

        if (!$this->checkUser()) return response()->json([
            'status' => 403,
            'message' => 'Unauthorized access!'
        ], 403);
        $user = Auth::user();

        if(
            $request->user_type != 'Admin'
            && $request->user_type != 'Employee'
            && $request->user_type != 'AdminOrEmployee'
        ) return response()->json([ 
            'status' => 404,
            'message' => 'Invalid user type input!',
            'user_type' => $request->user_type
        ]);
        $employees = UsersModel
            ::select('id', 'user_name', 'last_name', 'first_name', 'middle_name', 'suffix', 'department_id')
            ->where('client_id', $user->client_id)
            ->where('user_type', $request->user_type)
        ;
        switch($request->user_type) {
            case 'Admin':
            case 'Employee':
                $employees = $employees->where('user_type', $request->user_type);
                break;
            case 'AdminOrEmployee':
                $employees = $employees
                    ->where('user_type', 'Admin')
                    ->orWhere('user_type', 'Employee')
                ;
                break;
        }
        if($request->department_id !== null)
            $employees = $employees->where('department_id', $request->department_id);
        if($request->branch_id !== null)
            $employees = $employees->where('branch_id', $request->branch_id);
        $employees = $employees
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->orderBy('middle_name')
            ->orderBy('suffix')
            ->get()
        ;
        if(!$employees) return response()->json([ 
            'status' => 404,
            'message' => 'Employees not found!'
        ]);
        return response()->json([
            'status' => 200,
            'message' => 'Employees successfully retrieved.',
            'users' => $employees
        ]);

    }

    //get each of the department's details, along with their assigned employees per department position
    public function getDepartmentWithEmployeePosition()
    {
        if (!$this->checkUser()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }

        $user = Auth::user();
        $departments = DepartmentsModel::where('client_id', $user->client_id)->get();
        $result = [];

        foreach ($departments as $department) {
            // Get assigned employees (those with department_position_id)
            $assigned = UsersModel::with(['branch', 'departmentPosition'])
                ->where('department_id', $department->id)
                ->whereNotNull('department_position_id')
                ->get();
            
            $unassigned = UsersModel::with('branch')
                ->where('department_id', $department->id)
                ->whereNull('department_position_id')
                ->get();


            // Group employees by department_position_id
            $grouped = $assigned->groupBy('department_position_id');
            $assignedPositions = [];

            foreach ($grouped as $positionId => $groupedEmployees) {
                $position = DepartmentPosition::find($positionId);
                if (!$position) continue;

                $assignedWithAvatars = $groupedEmployees->map(function ($employee) {
                    if ($employee->profile_pic && Storage::disk('public')->exists($employee->profile_pic)) {
                        $employee->avatar = base64_encode(Storage::disk('public')->get($employee->profile_pic));
                        $employee->avatar_mime = mime_content_type(storage_path('app/public/' . $employee->profile_pic));
                    } else {
                        $employee->avatar = null;
                        $employee->avatar_mime = null;
                    }
                    return $employee;
                });

                $assignedPositions[] = [
                    'id' => $position->id,
                    'name' => $position->name,
                    'can_review_request' => $position->can_review_request,
                    'can_approve_request' => $position->can_approve_request,
                    'can_note_request' => $position->can_note_request,
                    'can_accept_request' => $position->can_accept_request,
                    'employees' => $assignedWithAvatars,
                ];
            }

            //process unassigned 'employees' avatars
            $unassignedWithAvatars = $unassigned->map(function ($employee){
                if ($employee->profile_pic && Storage::disk('public')->exists($employee->profile_pic)) {
                    $employee->avatar = base64_encode(Storage::disk('public')->get($employee->profile_pic));
                    $employee->avatar_mime = mime_content_type(storage_path('app/public/' . $employee->profile_pic));
                } else {
                    $employee->avatar = null;
                    $employee->avatar_mime = null;
                }
                return $employee;    
            });

            $result[] = [
                'id' => $department->id,
                'name' => $department->name,
                'acronym' => $department->acronym,
                'assigned_positions' => $assignedPositions,
                'unassigned_employees' => $unassignedWithAvatars,
            ];
        }
        return response()->json(['status' => 200, 'departments' => $result]);
    }
    
    //get details from a specific department
    public function getDepartmentDetails(Request $request)
    {
        if (!$this->checkUser()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }

        $user = Auth::user();
        $department = DepartmentsModel::where('id', $request->departmentId)
        ->where('client_id', $user->client_id)
        ->first();

        if (!$department) {
            return response()->json(['status' => 404, 'message' => 'Department not found'], 404);
        }

        // Load employees that belong to this department (including their branch and position)
        $employees = UsersModel::select('id','email', 'user_name', 'first_name', 
            'last_name', 'user_type', 'profile_pic', 'branch_id', 'department_id', 'department_position_id')
            ->with(['branch', 'departmentPosition'])
            ->where('department_id', $request->departmentId)       
            ->get();

        return response()->json([
            'status' => 200,
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
                'acronym' => $department->acronym,
                'employees' => $employees
            ]
        ]);
    }
    
    public function saveDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
        ]);

        if (!$this->checkUser() && !$validated) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }

        $user = Auth::user();
        $client = ClientsModel::find($user->client_id);

        try {
            DB::beginTransaction();
            DepartmentsModel::updateOrCreate(
                [
                    'id' => $request->id,
                    'client_id' => $client->id,
                ],
                [
                    'name' => $request->name,
                    'acronym' => $request->acronym,
                    'description' => $request->description,
                    'status' => $request->id ? $request->status : 'Active', // On creation, set status to active
                    'client_id' => $client->id, 
                ]
            );

            DB::commit();
            return response()->json(['status' => 200, 'message' => 'Successfully Saved']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error saving: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error saving department'], 500);
        }
    }
    public function updateDepartmentPositionAssignments(Request $request, $departmentId)
    {
        if (!$this->checkUser()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'department_position_id' => 'required|exists:department_positions,id',
            'add_employee_ids' => 'array',
            'add_employee_ids.*' => 'exists:users,id',
            'remove_employee_ids' => 'array',
            'remove_employee_ids.*' => 'exists:users,id',
        ]);

        $departmentPositionId = $request->department_position_id;
        $addIds = $request->add_employee_ids ?? [];
        $removeIds = $request->remove_employee_ids ?? [];

        // Assign employees
        UsersModel::whereIn('id', $addIds)->update([
            'department_id' => $departmentId,
            'department_position_id' => $departmentPositionId
        ]);

        // Remove employees (set position to null)
        UsersModel::whereIn('id', $removeIds)
            ->where('department_position_id', $departmentPositionId) // Ensure only removing from this position
            ->update([
                'department_position_id' => null
            ]);
        return response()->json(['status' => 200, 'message' => 'Employee assignments updated.']);
    }

   public function editDepartment(Request $request)
    {
        log::info("SettingsController::editDepartment");

        $validated = $request->validate([
            'id' => 'required|exists:departments,id',
            'name' => 'required|string|max:255',
            'acronym' => 'required|string|max:10',
            'status' => 'required|in:Active,Inactive,Disabled',
            'manager_id' => 'nullable|exists:users,id',
            'supervisor_id' => 'nullable|exists:users,id',
            'approver_id' => 'nullable|exists:users,id',
            'leave_limit' => 'required|integer|min:0'
        ]);

        if ($this->checkUser() && $validated) {
            try {
                DB::beginTransaction();

                $department = DepartmentsModel::findOrFail($request->id);
                
                $department->update([
                    'name' => $request->name,
                    'acronym' => $request->acronym,
                    'description' => $request->description,
                    'status' => $request->status,
                    'manager_id' => $request->manager_id,
                    'supervisor_id' => $request->supervisor_id,
                    'approver_id' => $request->approver_id,
                    'leave_limit' => $request->leave_limit
                ]);

                DB::commit();

                // Return the updated department with personnel names
                $updatedDepartment = DepartmentsModel::with(['manager', 'supervisor', 'approver'])
                    ->find($request->id);

                return response()->json([
                    'status' => 200,
                    'department' => $updatedDepartment,
                    'message' => 'Department updated successfully'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error updating department: " . $e->getMessage());
                return response()->json([
                    'status' => 500,
                    'message' => 'Error updating department'
                ], 500);
            }
        }

        return response()->json([
            'status' => 403,
            'message' => 'Unauthorized'
        ], 403);
    }





public function addBranchPositionAssignments(Request $request)
    {
        // For now, just return the incoming data to test
        return response()->json([
            'message' => 'Assignments received!',
            'data' => $request->all()
        ]);
    }

 

    public function saveDepartmentPositions(Request $request){
        $user = Auth::user();

        $validated = $request->validate([
            'id' => 'nullable|exists:department_positions,id',
            'name' => 'required|string|max:255',
            'can_review_request' => 'required|boolean',
            'can_approve_request' => 'required|boolean',
            'can_note_request' => 'required|boolean',
            'can_accept_request' => 'required|boolean',
        ]);
        $validated['client_id'] = $user->client_id;
        
        $position = DepartmentPosition::updateOrCreate(
            ['id' => $request->id],
            array_merge($validated)
        );

        return response()->json([
            'status' => 200,
            'message' => $request->id ? 'Position updated' : 'Position created',
            'positions' => $position
        ]);
    }

    public function getBranchPositions()
    {
        $user = Auth::user();

        $positions = BranchPosition::where('client_id', $user->client_id)->get();

        return response()->json([
            'status' => 200,
            'positions' => $positions
        ]);
    }

    public function getJobTitles(Request $request)
    {
        // Log::info("SettingsController::getJobTitles");

        if ($this->checkUser()) {
            $user = Auth::user();
            $jobTitles = JobTitlesModel::where('client_id', $user->client_id)->get();

            return response()->json(['status' => 200, 'jobTitles' => $jobTitles]);
        }

        return response()->json(['status' => 200, 'jobTitles' => null]);
    }

    public function saveJobTitle(Request $request)
    {
        // log::info("SettingsController::saveJobTitle");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $jobTitle = JobTitlesModel::create([
                    "name" => $request->name,
                    "acronym" => $request->acronym,
                    "status" => "Active",
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'jobTitle' => $jobTitle]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function editJobTitle(Request $request)
    {
        log::info("SettingsController::editJobTitle");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
            'status' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $jobTitle = JobTitlesModel::find($request->input('id'));

            $jobTitle->name = $request->input('name');
            $jobTitle->acronym = $request->input('acronym');
            $jobTitle->status = $request->input('status');

            $jobTitle->save();

            return response()->json(['status' => 200]);
        }
    }

    // public function getRoles(Request $request)
    // {
    //     // Log::info("SettingsController::getRoles");

    //     if ($this->checkUser()) {
    //         $user = Auth::user();
    //         $roles = EmployeeRolesModel::where('client_id', $user->client_id)->get();

    //         return response()->json(['status' => 200, 'roles' => $roles]);
    //     }

    //     return response()->json(['status' => 200, 'roles' => null]);
    // }

    public function saveRole(Request $request)
    {
        // log::info("SettingsController::saveRole");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $role = EmployeeRolesModel::create([
                    "name" => $request->name,
                    "acronym" => $request->acronym,
                    "status" => "Active",
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'role' => $role]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function editRole(Request $request)
    {
        //log::info("SettingsController::editRole");

        $validated = $request->validate([
            'name' => 'required',
            'acronym' => 'required',
            'status' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $role = EmployeeRolesModel::find($request->input('id'));

            $role->name = $request->input('name');
            $role->acronym = $request->input('acronym');
            $role->status = $request->input('status');

            $role->save();

            return response()->json(['status' => 200]);
        }
    }

    public function saveApplicationType(Request $request)
    {
        // log::info("SettingsController::saveApplicationType");
        Log::info($request);

        $validated = $request->validate([
            'name' => 'required',
            'tenureship_required' => 'required',
            'require_files' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $client = ClientsModel::find($user->client_id);

            try {
                DB::beginTransaction();

                $role = ApplicationTypesModel::create([
                    "name" => $request->name,
                    "percentage" => 0.00,
                    "require_files" => $request->require_files,
                    "tenureship_required" => $request->tenureship_required,
                    "client_id" => $client->id,
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'role' => $role]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function editApplicationType(Request $request)
    {
        //log::info("SettingsController::editApplicationType");

        $validated = $request->validate([
            'name' => 'required',
            'tenureship_required' => 'required',
            'require_files' => 'required',
        ]);

        if ($this->checkUser() && $validated) {

            $user = Auth::user();
            $appType = ApplicationTypesModel::find($request->input('id'));

            $appType->name = $request->input('name');
            $appType->tenureship_required = $request->input('tenureship_required');
            $appType->require_files = $request->input('require_files');

            $appType->save();

            return response()->json(['status' => 200]);
        }
    }



    // Trial 
    public function getRoles()
    {
        try {
            $roles = \App\Models\EmployeeRolesModel::all();
            return response()->json(['roles' => $roles]);
        } catch (\Exception $e) {
            \Log::error('getRoles: ' . $e->getMessage());
            return response()->json(['error' => 'Error fetching roles'], 500);
        }
    }

    public function getEmploymentTypes()
    {
        try {
            $types = \App\Models\EmployeeTypeModel::all();
            return response()->json(['employment_types' => $types]);
        } catch (\Exception $e) {
            \Log::error('getEmploymentTypes: ' . $e->getMessage());
            return response()->json(['error' => 'Error fetching employment types'], 500);
        }
    }

    public function getStatuses()
    {
        // If you want to use a fixed list:
        $statuses = ['Active', 'Resigned', 'Terminated'];
        return response()->json(['statuses' => $statuses]);
    }
}
