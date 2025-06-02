<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\BranchesModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
class BranchController extends Controller
{

    // branch

    public function getBranches(Request $request)
    {
        // inputs:
        /*
            status?: 'active' | 'inactive' | 'disabled' = 'active'
        */

        // returns:
        /*
            branches: {
                id, name, acronym, address, status, client_id, leave_limit, manager_id,
                supervisor_id, approver_id, created_at, updated_at
            }[]
        */

        log::info('BranchController::getBranches');

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
    
        $user = DB::table('users')->where('id', $userID)->first();

        try {

            $branches = BranchesModel::select(
                'id', 'name', 'acronym', 'address', 'status', 'client_id', 'leave_limit',
                'manager_id', 'supervisor_id', 'approver_id', 'created_at', 'updated_at'
            );
            switch($request->status) {
                case 'disabled':
                    $branches = $branches->where('status', 'Disabled');
                case 'inctive':
                    $branches = $branches->where('status', 'Inactive');
                case 'active':
                default:
                    $branches = $branches->where('status', 'Active');
            }
            $branches = $branches->orderBy('name')->get();
            if( !$branches->count() ) return response()->json([
                'status' => 200,
                'message' => 'No Branches found.'
            ]);
            return response()->json([
                'status' => 200,
                'message' => 'Branches successfully retrieved.',
                'branches' => $branches
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error saving work shift: ' . $e->getMessage());

            throw $e;
        }
    
    }

}
