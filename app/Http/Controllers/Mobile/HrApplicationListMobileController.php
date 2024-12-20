<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\HrApplicationList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class HrApplicationListMobileController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $applicationsList = HrApplicationList::where('is_deleted', 0)
                ->where('team', $user->team)
                ->get();

            if ($applicationsList) {
                return response()->json([
                    'applicationsList' => $applicationsList
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Applications list not found'
                ], 404);
            }
            Log::info('Ikaw bahala unsa imong ibutang dira', ['hr_application_list' => $applicationsList->toArray()] );
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}