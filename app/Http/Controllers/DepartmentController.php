<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\DepartmentsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
class DepartmentController extends Controller
{

    // department

    public function getDepartments(Request $request)
    {
        // inputs:
        /*
            status?: 'active' | 'inactive' | 'disabled' = 'active'
        */

        // returns:
        /*
            departments: {
                id, name, acronym, description, status, client_id, leave_limit, manager_id,
                supervisor_id, approver_id, created_at, updated_at
            }[]
        */

        log::info('DepartmentController::getDepartments');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $userID = Auth::check() ? Auth::id() : null;
    $user = DB::table('users')->where('id', $userID)->first();

        try {

            $departments = DepartmentsModel::select(
                'id', 'name', 'acronym', 'description', 'status', 'client_id', 'created_at', 'updated_at'
            );
            switch($request->status) {
                case 'disabled':
                    $departments = $departments->where('status', 'Disabled');
                case 'inactive':
                    $departments = $departments->where('status', 'Inactive');
                case 'active':
                default:
                    $departments = $departments->where('status', 'Active');
                    break;
            }
            $departments = $departments->orderBy('name')->get();
            if( !$departments->count() ) return response()->json([
                'status' => 200,
                'message' => 'No Departments found.'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Departments successfully retrieved.',
                'departments' => $departments
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

}
