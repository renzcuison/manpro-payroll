<?php

namespace App\Http\Controllers;

use App\Models\AnnouncementAcknowledgementsModel;
use App\Models\AnnouncementViewsModel;
use App\Models\UsersModel;

use App\Models\AnnouncementsModel;
use App\Models\AnnouncementDepartmentsModel;
use App\Models\AnnouncementBranchesModel;
use App\Models\AnnouncementEmployeeRoleModel;
use App\Models\AnnouncementEmployeeTypeModel; 
use App\Models\AnnouncementEmployeeStatusModel;
use App\Models\EmployeeTypeModel;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class AnnouncementsController extends Controller
{
    // Authentication
    public function checkUser()
    {
        //Log::info("AnnouncementsController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    } 
    
    // Lists
    public function getAnnouncements()
    {
        $user = Auth::user();
        //Log::info("AnnouncementsController::getAnnouncements");

        if (!$this->checkUser($user)) {
            Log::warning('getAnnouncements: Unauthorized access', ['user_id' => $user ? $user->id : null]);
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }

        try {
            $announcements = AnnouncementsModel::with(['views.user', 'branches', 'departments'])
                ->whereIn('status', ['Published', 'Pending', 'Hidden']) // Include Hidden
                ->orderBy('created_at', 'desc')
                ->get();

            $formattedAnnouncements = $announcements->map(function ($announcement) {
                $viewCount = $announcement->views->count();
                // Count unique employees in assigned branches and departments !!ADD FOR ADDITIONAL ROLES, STATUS, AND EMPLOYMENT TYPE!!!
                $branchIds = $announcement->branches->pluck('branch_id')->toArray();
                $departmentIds = $announcement->departments->pluck('department_id')->toArray();
                $recipientCount = UsersModel::where('user_type', 'Employee')
                    ->where(function ($query) use ($branchIds, $departmentIds) {
                        if (!empty($branchIds)) {
                            $query->whereIn('branch_id', $branchIds);
                        }
                        if (!empty($departmentIds)) {
                            $query->orWhereIn('department_id', $departmentIds);
                        }
                    })
                    ->distinct('id')
                    ->count();
                // Count acknowledgments
                $acknowledgedCount = AnnouncementAcknowledgementsModel::where('announcement_id', $announcement->id)->count();
                
                $views = $announcement->views->map(function ($view) {
                    $profilePic = $view->user && $view->user->profile_pic
                        ? asset('storage/' . $view->user->profile_pic)
                        : asset('images/default-avatar.png');
                    return [
                        'user_id' => $view->user ? $view->user->id : null,
                        'first_name' => $view->user ? $view->user->first_name : 'Unknown',
                        'last_name' => $view->user ? $view->user->last_name : 'User',
                        'profile_pic' => $profilePic,
                        'branch_name' => $view->user && $view->user->branch ? $view->user->branch->name : null,
                        'department_name' => $view->user && $view->user->department ? $view->user->department->name : null,
                        'viewed_at' => $view->viewed_at,
                    ];
                });

                $acknowledgements = $announcement->acknowledgements->map(function ($acknowledgement) {
                    $profilePic = $acknowledgement->user && $acknowledgement->user->profile_pic
                        ? asset('storage/' . $acknowledgement->user->profile_pic)
                        : asset('images/default-avatar.png');
                    return [
                        'user_id' => $acknowledgement->user ? $acknowledgement->user->id : null,
                        'first_name' => $acknowledgement->user ? $acknowledgement->user->first_name : 'Unknown',
                        'last_name' => $acknowledgement->user ? $acknowledgement->user->last_name : 'User',
                        'profile_pic' => $profilePic,
                    ];
                });

                return [
                    'id' => $announcement->id,
                    'unique_code' => $announcement->unique_code,
                    'title' => $announcement->title,
                    'description' => $announcement->description,
                    'status' => $announcement->status,
                    'created_at' => $announcement->created_at,
                    'updated_at' => $announcement->updated_at,
                    'viewed' => $viewCount,
                    'recipients' => $recipientCount,
                    'acknowledged' => $acknowledgedCount,
                    'views' => $views,
                    'acknowledgements' => $acknowledgements,
                ];
            });

            //Log::info('getAnnouncements: Successfully fetched announcements', ['count' => $formattedAnnouncements->count()]);

            return response()->json(['status' => 200, 'announcements' => $formattedAnnouncements]);
        } catch (\Exception $e) {
            Log::error('getAnnouncements: Error fetching announcements', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['status' => 500, 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    public function getViews($code)
    {
        $user = Auth::user();
        if (!$this->checkUser($user)) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }

        try {
            $announcement = AnnouncementsModel::where('unique_code', $code)->firstOrFail();
            $views = AnnouncementViewsModel::where('announcement_id', $announcement->id)
                ->join('users', 'announcement_views.user_id', '=', 'users.id')
                ->leftJoin('branches', 'users.branch_id', '=', 'branches.id')
                ->leftJoin('departments', 'users.department_id', '=', 'departments.id')
                ->select(
                    'users.id as user_id',
                    'users.first_name',
                    'users.last_name',
                    'users.profile_pic',
                    'branches.name as branch_name',
                    'departments.name as department_name',
                    'announcement_views.viewed_at'
                )
                ->get()
                ->map(function ($view) {
                    $profilePic = $view->profile_pic
                        ? asset('storage/' . $view->profile_pic)
                        : asset('images/default-avatar.png');
                    return [
                        'user_id' => $view->user_id,
                        'first_name' => $view->first_name,
                        'last_name' => $view->last_name,
                        'profile_pic' => $profilePic,
                        'branch_name' => $view->branch_name,
                        'department_name' => $view->department_name,
                        'viewed_at' => $view->viewed_at,
                    ];
                });

            return response()->json(['status' => 200, 'views' => $views]);
        } catch (\Exception $e) {
            Log::error('getViews: Error fetching views', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['status' => 500, 'message' => 'Server error'], 500);
        }
    }

    public function logView(Request $request)
    {
        $request->validate(['announcement_code' => 'required|string']);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 401, 'message' => 'Unauthorized'], 401);
        }

        try {
            $announcement = AnnouncementsModel::where('unique_code', $request->announcement_code)
                ->where('status', 'Published')
                ->firstOrFail();

            $existingView = AnnouncementViewsModel::where('announcement_id', $announcement->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existingView) {
                return response()->json(['status' => 200, 'message' => 'View already logged']);
            }

            AnnouncementViewsModel::create([
                'announcement_id' => $announcement->id,
                'user_id' => $user->id,
                'viewed_at' => now(),
            ]);

            return response()->json(['status' => 200, 'message' => 'View logged']);
        } catch (\Exception $e) {
            Log::error('logView: Error logging view', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['status' => 500, 'message' => 'Server error'], 500);
        }
    }

    public function getEmployeeAnnouncements()
    {
        //Log::info("AnnouncementsController::getEmployeeAnnouncements");
        $user = Auth::user();
        if (!$user) {
            Log::warning('Unauthenticated user attempted to access getEmployeeAnnouncements');
            return response()->json(['status' => 401, 'message' => 'Unauthenticated'], 401);
        }

        try {
            $announcements = AnnouncementsModel::where('status', 'Published')
                ->where(function ($query) use ($user) {
                    $query->whereHas('branches', function ($q) use ($user) {
                        $q->where('branch_id', $user->branch_id);
                    })->orWhereHas('departments', function ($q) use ($user) {
                        $q->where('department_id', $user->department_id);
                    });
                })
                ->with(['acknowledgements' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                }])
                ->get();

            $announcementData = $announcements->map(function ($announcement) use ($user) {
                $branchMatched = $announcement->branches->pluck('branch_id')->contains($user->branch_id);
                $departmentMatched = $announcement->departments->pluck('department_id')->contains($user->department_id);
                $acknowledgedOn = $announcement->acknowledgements->firstWhere('user_id', $user->id)?->created_at;

                return [
                    'id' => $announcement->id,
                    'unique_code' => $announcement->unique_code,
                    'title' => $announcement->title,
                    'updated_at' => $announcement->updated_at,
                    'branch_matched' => $branchMatched,
                    'department_matched' => $departmentMatched,
                    'acknowledged_on' => $acknowledgedOn,
                ];
            })->all();

            return response()->json([
                'status' => 200,
                'announcements' => $announcementData,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getEmployeeAnnouncements: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['status' => 500, 'message' => 'Internal Server Error'], 500);
        }
    }

    // Management
    public function saveAnnouncement(Request $request)
    {
        //Log::info("AnnouncementsController::saveAnnouncement");

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $uniqueCode = $this->generateRandomCode(16);
                while (AnnouncementsModel::where('unique_code', $uniqueCode)->exists()) {
                    $uniqueCode = $this->generateRandomCode(16);
                }

                // Announcement Entry
                $announcement = AnnouncementsModel::create([
                    'unique_code' => $uniqueCode,
                    'user_id' => $user->id,
                    'client_id' => $user->client_id,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                ]);

                // Adding Files - Documents
                if ($request->hasFile('attachment')) {
                    foreach ($request->file('attachment') as $file) {
                        $announcement->addMedia($file)
                            ->withCustomProperties(['type' => 'Document'])
                            ->toMediaCollection('documents');
                    }
                }

                // Adding Files - Images
                if ($request->hasFile('image')) {
                    foreach ($request->file('image') as $index => $file) {
                        $isThumbnail = $index == $request->input('thumbnail');
                        $collection = $isThumbnail ? 'thumbnails' : 'images';
                        $announcement->addMedia($file)
                            ->withCustomProperties(['type' => $isThumbnail ? 'Thumbnail' : 'Image'])
                            ->toMediaCollection($collection);
                    }
                }

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error Saving Announcement'], 500);
                throw $e;
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function editAnnouncement(Request $request)
    {
        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                // Announcement Update
                $announcement = AnnouncementsModel::where('unique_code', $request->input('unique_code'))->first();

                $announcement->title = $request->input('title');
                $announcement->description = $request->input('description');
                $announcement->save();

                // File Removal Prep
                $deleteFiles = array_merge(
                    $request->input('deleteImages', []), 
                    $request->input('deleteAttachments', [])
                );

                // Remove Files
                if (!empty($deleteFiles)) {
                    $mediaItems = $announcement->getMedia('*')->whereIn('id', $deleteFiles);
                    foreach ($mediaItems as $media) {
                        $media->delete();
                    }
                }

                // Adding Files - Documents
                if ($request->hasFile('attachment')) {
                    foreach ($request->file('attachment') as $file) {
                        $announcement->addMedia($file)
                            ->withCustomProperties(['type' => 'Document'])
                            ->toMediaCollection('documents');
                    }
                }

                // Adding Files - Images
                if ($request->hasFile('image')) {
                    foreach ($request->file('image') as $index => $file) {
                        $isThumbnail = $index == $request->input('thumbnail');
                        if ($isThumbnail) {
                            $announcement->clearMediaCollection('thumbnails');
                        }
                        $collection = $isThumbnail ? 'thumbnails' : 'images';
                        $announcement->addMedia($file)
                            ->withCustomProperties(['type' => $isThumbnail ? 'Thumbnail' : 'Image'])
                            ->toMediaCollection($collection);
                    }
                }

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        }

        return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
    }

    // public function publishAnnouncement(Request $request)
    // {
    //     //Log::info("AnnouncementsController::publishAnnouncement");
    //     //Log::info($request);

    //     $user = Auth::user();

    //     if ($this->checkUser()) {
    //         try {
    //             DB::beginTransaction();

    //             $announcement = AnnouncementsModel::where('unique_code', $request->input('unique_code'))->first();
    //             $announcement->status = "Published";
    //             $announcement->save();

    //             foreach ($request->input('departments') as $key => $departmentId) {
    //                 Log::info($announcement->id . " " . $departmentId);
    //                 AnnouncementDepartmentsModel::create([
    //                     'announcement_id' => $announcement->id,
    //                     'department_id' => $departmentId
    //                 ]);
    //             }

    //             foreach ($request->input('branches') as $key => $branchId) {
    //                 Log::info($announcement->id . " " . $branchId);
    //                 AnnouncementBranchesModel::create([
    //                     'announcement_id' => $announcement->id,
    //                     'branch_id' => $branchId
    //                 ]);
    //             }

    //             DB::commit();

    //             return response()->json(['status' => 200]);
    //         } catch (\Exception $e) {
    //             DB::rollBack();

    //             Log::error("Error saving: " . $e->getMessage());

    //             throw $e;
    //         }
    //     } else {
    //         return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
    //     }
    // }

    public function toggleHide(Request $request, $code)
    {
        $user = Auth::user();

        if (!$this->checkUser($user)) {
            Log::warning('toggleHide: Unauthorized access', ['user_id' => $user ? $user->id : null]);
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }

        try {
            // Validate the code parameter
            $validated = Validator::make(['code' => $code], [
                'code' => 'required|string|exists:announcements,unique_code',
            ]);

            if ($validated->fails()) {
                Log::warning('toggleHide: Invalid unique_code', ['code' => $code, 'errors' => $validated->errors()]);
                return response()->json(['status' => 422, 'message' => $validated->errors()->first()], 422);
            }

            $announcement = AnnouncementsModel::where('unique_code', $code)->first();

            if (!$announcement) {
                Log::warning('toggleHide: Announcement not found', ['unique_code' => $code]);
                return response()->json(['status' => 404, 'message' => 'Announcement not found'], 404);
            }

            $newStatus = $announcement->status === 'Published' ? 'Hidden' : 'Published';
            $announcement->status = $newStatus;
            $announcement->save();

            return response()->json(['status' => 200, 'announcement' => [
                'unique_code' => $announcement->unique_code,
                'status' => $announcement->status,
            ]]);
        } catch (\Exception $e) {
            Log::error('toggleHide: Error toggling status', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'unique_code' => $code,
            ]);
            return response()->json(['status' => 500, 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    // Details
    public function getAnnouncementDetails($code)
    {
        //Log::info("AnnouncementsController::getAnnouncementDetails");
        $user = Auth::user();

        if ($this->checkUser()) {
            $announcement = AnnouncementsModel::where('unique_code', $code)
                ->with('user')
                ->firstOrFail();

            // Author Information
            $author = $announcement->user;
            $announcement->author_name = implode(' ', array_filter([
                $author->first_name ?? null,
                $author->middle_name ?? null,
                $author->last_name ?? null,
                $author->suffix ?? null,
            ]));
            $announcement->author_title = $author->jobTitle->name;

            $announcementData = $announcement->toArray();
            unset($announcementData['user']);

            return response()->json(['status' => 200, 'announcement' => $announcementData]);
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function getEmployeeAnnouncementDetails($code)
    {
        //Log::info("AnnouncementsController::getEmployeeAnnouncementDetails");

        $user = Auth::user();
        if (!$user) {
            Log::warning('Unauthenticated user attempted to access getEmployeeAnnouncementDetails');
            return response()->json(['status' => 401, 'message' => 'Unauthenticated'], 401);
        }

        try {
            $announcement = AnnouncementsModel::where('unique_code', $code)
                ->where('status', 'Published')
                ->where(function ($query) use ($user) {
                    $query->whereHas('branches', function ($q) use ($user) {
                        $q->where('branch_id', $user->branch_id);
                    })->orWhereHas('departments', function ($q) use ($user) {
                        $q->where('department_id', $user->department_id);
                    });
                })
                ->with(['acknowledgements' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                }, 'user'])
                ->firstOrFail();

            $branchMatched = $announcement->branches->pluck('branch_id')->contains($user->branch_id);
            $departmentMatched = $announcement->departments->pluck('department_id')->contains($user->department_id);
            $acknowledged = $announcement->acknowledgements->firstWhere('user_id', $user->id) !== null;
            $ackTimestamp = $announcement->acknowledgements->firstWhere('user_id', $user->id)?->created_at;

            return response()->json([
                'status' => 200,
                'announcement' => [
                    'id' => $announcement->id,
                    'unique_code' => $announcement->unique_code,
                    'title' => $announcement->title,
                    'description' => $announcement->description,
                    'updated_at' => $announcement->updated_at,
                    'author_name' => $announcement->user ? $announcement->user->first_name . ' ' . $announcement->user->last_name : null,
                    'author_title' => $announcement->user ? $announcement->user->title : null,
                    'branch_matched' => $branchMatched,
                    'department_matched' => $departmentMatched,
                    'acknowledged' => $acknowledged,
                    'ack_timestamp' => $ackTimestamp,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getEmployeeAnnouncementDetails: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['status' => 500, 'message' => 'Internal Server Error'], 500);
        }
    }
    
    public function getAnnouncementBranchDepts($code)
    {
        //Log::info("AnnouncementsController::getAnnouncementBranchDepts");

        $user = Auth::user();

        if ($this->checkUser()) {
            $announcement = AnnouncementsModel::where('unique_code', $code)
                ->select('id')
                ->first();

            $branches = AnnouncementBranchesModel::where('announcement_id', $announcement->id)
                ->join('branches', 'announcement_branches.branch_id', '=', 'branches.id')
                ->select('announcement_branches.announcement_id', 'branches.acronym')
                ->distinct()
                ->pluck('acronym')
                ->unique()
                ->toArray();

            $departments = AnnouncementDepartmentsModel::where('announcement_id', $announcement->id)
                ->join('departments', 'announcement_departments.department_id', '=', 'departments.id')
                ->select('announcement_departments.announcement_id', 'departments.acronym')
                ->distinct()
                ->pluck('acronym')
                ->unique()
                ->toArray();

            return response()->json(['status' => 200, 'branches' => $branches, 'departments' => $departments]);
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    // Files
    public function downloadFile($id)
    {
        //Log::info('AnnouncementsController::downloadFile');
        $media  = Media::find($id);

        if (!$media) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        $filePath = $media->getPath();
        if (!file_exists($filePath)) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        return response()->download($filePath, $media->file_name);
    }

    public function getThumbnail($code)
    {
        $user = Auth::user();
        $announcement = AnnouncementsModel::where('unique_code', $code)
            ->select('id')
            ->first();

        if (!$announcement) {
            return response()->json(['status' => 404, 'message' => 'Announcement not found'], 404);
        }

        $thumbnail = null;
        $thumbnailMedia = $announcement->getMedia('thumbnails')->first();
        if ($thumbnailMedia) {
            $thumbnail = base64_encode(file_get_contents($thumbnailMedia->getPath()));
        }

        return response()->json(['status' => 200, 'thumbnail' => $thumbnail]);
    }

    public function getPageThumbnails(Request $request)
    {
        //Log::info("AnnouncementsController::getPageThumbnails");
        $announcementIds = $request->input('announcement_ids', []);
        $announcements = AnnouncementsModel::whereIn('id', $announcementIds)->get();

        $thumbnails = array_fill_keys($announcementIds, null);
        foreach ($announcements as $announcement) {
            $thumbnailMedia = $announcement->getMedia('thumbnails')->first();
            if ($thumbnailMedia) {
                $thumbnails[$announcement->id] = base64_encode(file_get_contents($thumbnailMedia->getPath()));
            }
        }

        return response()->json(['status' => 200, 'thumbnails' => array_values($thumbnails)]);
    }

    public function getAnnouncementFiles($code)
    {
        $user = Auth::user();

        if ($this->checkUser()) {
            $announcement = AnnouncementsModel::where('unique_code', $code)
                ->select('id')
                ->firstOrFail();

            // Images
            $images = $announcement->getMedia('images')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'filename' => $media->file_name,
                    'type' => $media->getCustomProperty('type'),
                    'data' => base64_encode(file_get_contents($media->getPath())),
                    'mime' => $media->mime_type,
                ];
            })->all();

            $thumbnails = $announcement->getMedia('thumbnails')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'filename' => $media->file_name,
                    'type' => $media->getCustomProperty('type'),
                    'data' => base64_encode(file_get_contents($media->getPath())),
                    'mime' => $media->mime_type,
                ];
            })->all();

            $imageData = array_merge($images, $thumbnails);

            // Documents
            $attachmentData = $announcement->getMedia('documents')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'filename' => $media->file_name,
                    'type' => $media->getCustomProperty('type'),
                ];
            })->all();

            return response()->json([
                'status' => 200,
                'images' => $imageData,
                'attachments' => $attachmentData,
            ]);
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function getEmployeeAnnouncementFiles($code)
    {
        $user = Auth::user();

        $announcement = AnnouncementsModel::where('unique_code', $code)
            ->select('id')
            ->firstOrFail();

        // Images
        $images = $announcement->getMedia('images')->map(function ($media) {
            return [
                'id' => $media->id,
                'filename' => $media->file_name,
                'type' => $media->getCustomProperty('type'),
                'data' => base64_encode(file_get_contents($media->getPath())),
                'mime' => $media->mime_type,
            ];
        })->all();

        $thumbnails = $announcement->getMedia('thumbnails')->map(function ($media) {
            return [
                'id' => $media->id,
                'filename' => $media->file_name,
                'type' => $media->getCustomProperty('type'),
                'data' => base64_encode(file_get_contents($media->getPath())),
                'mime' => $media->mime_type,
            ];
        })->all();

        $imageData = array_merge($images, $thumbnails);

        // Documents
        $attachmentData = $announcement->getMedia('documents')->map(function ($media) {
            return [
                'id' => $media->id,
                'filename' => $media->file_name,
                'type' => $media->getCustomProperty('type'),
            ];
        })->all();

        return response()->json([
            'status' => 200,
            'images' => $imageData,
            'attachments' => $attachmentData,
        ]);
    }

    // Acknowledgements
    public function acknowledgeAnnouncement(Request $request)
    {
        //Log::info("AnnouncementsController::acknowledgeAnnouncement");
        $user = Auth::user();

        try {
            DB::beginTransaction();

            $announcement = AnnouncementsModel::where('unique_code', $request->input('code'))->select('id')->first();

            AnnouncementAcknowledgementsModel::create([
                'user_id' => $user->id,
                'announcement_id' => $announcement->id,
            ]);

            DB::commit();

            return response()->json(['status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }
    }

    public function getAcknowledgements($code)
    {
        //Log::info("AnnouncementsController::getAnnouncementAcknowledgements");
        $user = Auth::user();
        if ($this->checkUser()) {
            $clientId = $user->client_id;
            $announcement = AnnouncementsModel::where('unique_code', $code) //add new changes!
                ->with(['acknowledgements', 'branches', 'departments'])
                ->firstOrFail();

            // Acknowledged Users
            $acknowledgements = $announcement->acknowledgements->map(function ($ack) {
                $emp = $ack->user;

                return [
                    'emp_id' => $emp->id,
                    'emp_first_name' => $emp->first_name,
                    'emp_middle_name' => $emp->middle_name ?? '',
                    'emp_last_name' => $emp->last_name,
                    'emp_suffix' => $emp->suffix ?? '',
                    'emp_profile_pic' => $emp->profile_pic ?? null,
                    'timestamp' => $ack->created_at,
                    'branch_acronym' => $emp->branch ? $emp->branch->acronym : null,
                    'department_acronym' => $emp->department ? $emp->department->acronym : null,
                    'emp_type' => $emp->employment_type ?? null,
                    'emp_status' => $emp->employment_status ?? null,
                    'emp_role' => $emp->role ? $emp->role->acronym : null,
                ];
            })->all();

            // Unacknowledged Users
            $branches = $announcement->branches->pluck('branch_id')->unique()->toArray();
            $departments = $announcement->departments->pluck('department_id')->unique()->toArray();

            $acknowledgedUsers = $announcement->acknowledgements->pluck('user_id')->unique()->toArray();

            //Log::info($acknowledgedUsers);

                $unacknowledged = UsersModel::with(['branch', 'department', 'role'])
                ->where('client_id', $clientId)
                ->where(function ($query) use ($branches, $departments) {
                    if (!empty($branches)) {
                        $query->whereIn('branch_id', $branches);
                    }
                    if (!empty($departments)) {
                        $query->orWhereIn('department_id', $departments);
                    }
                })
                ->select('id', 'first_name', 'middle_name', 'last_name', 'suffix', 'profile_pic', 'branch_id', 'department_id', 'employment_type', 'employment_status', 'role_id')
                ->get()
                ->map(function ($employee) {
                    return [
                        'emp_id' => $employee->id,
                        'emp_first_name' => $employee->first_name,
                        'emp_middle_name' => $employee->middle_name ?? '',
                        'emp_last_name' => $employee->last_name,
                        'emp_suffix' => $employee->suffix ?? '',
                        'emp_profile_pic' => $employee->profile_pic ?? null,
                        'branch_acronym' => $employee->branch ? $employee->branch->acronym : null,
                        'department_acronym' => $employee->department ? $employee->department->acronym : null,
                        'emp_type' => $employee->employment_type ?? null,
                        'emp_status' => $employee->employment_status ?? null,
                        'emp_role' => $employee->role ? $employee->role->acronym : null,
                    ];
                })
                ->all();

                        //Log::info($unacknowledged);

                        return response()->json(['status' => 200, 'acknowledgements' => $acknowledgements, 'unacknowledged' => $unacknowledged]);
                    } else {
                        return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
                    }
                }

    // Utility
    function generateRandomCode($length)
    {
        Log::info("AnnouncementsController::generateRandomCode");
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $result = '';
        $charsLength = strlen($chars);

        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[rand(0, $charsLength - 1)];
        }

        return $result;
    }

    // Add Announcement Type
    function addAnnouncementType(Request $request)
    {
        $user = Auth::user();

        // Validate input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:announcement_types,name',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->errors()], 422);
        }

        try {
            // For testing, you may want to set client_id to a default value or null
            $type = \App\Models\AnnouncementTypesModel::create([
                'name' => $request->input('name'),
                'client_id' => 1, // Set a default client_id for testing
            ]);

            return response()->json(['status' => 200, 'type' => $type]);
        } catch (\Exception $e) {
            \Log::error('addAnnouncementType: ' . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Server error'], 500);
        }
    }

    //Get Announcement Types
    public function getAnnouncementType()
    {
        try {
            // You can filter by client_id if needed
            $types = \App\Models\AnnouncementTypesModel::all();

            return response()->json([
                'status' => 200,
                'types' => $types
            ]);
        } catch (\Exception $e) {
            \Log::error('getAnnouncementType: ' . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Server error'], 500);
        }
    }

    // Update Announcement Type
    public function updateAnnouncementType(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'id' => 'required|exists:announcement_types,id',
            'name' => 'required|string|max:255|unique:announcement_types,name,' . $request->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->errors()], 422);
        }

        try {
            $type = \App\Models\AnnouncementTypesModel::findOrFail($request->id);
            $type->name = $request->name;
            $type->save();

            return response()->json(['status' => 200, 'type' => $type]);
        } catch (\Exception $e) {
            \Log::error('updateAnnouncementType: ' . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Server error'], 500);
        }
    }

 public function publishAnnouncement(Request $request)
    {
        $user = Auth::user();

        if (!$this->checkUser()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'unique_code' => 'required|string|exists:announcements,unique_code',
            'departments' => 'required|array|min:1',
            'branches' => 'required|array|min:1',
            'announcement_type_id' => 'required|integer|exists:announcement_types,id',
            'role_ids' => 'array',
            'employment_types' => 'array',
            'employment_statuses' => 'array',
        ]);

        try {
            DB::beginTransaction();

            $announcement = AnnouncementsModel::where('unique_code', $request->input('unique_code'))->first();
            if (!$announcement) {
                return response()->json(['status' => 404, 'message' => 'Announcement not found'], 404);
            }

            $announcement->status = "Published";
            $announcement->announcement_type_id = $request->input('announcement_type_id');
            $announcement->save();

            // Clean up old relations
            AnnouncementDepartmentsModel::where('announcement_id', $announcement->id)->delete();
            AnnouncementBranchesModel::where('announcement_id', $announcement->id)->delete();
            AnnouncementEmployeeRoleModel::where('announcement_id', $announcement->id)->delete();
            AnnouncementEmployeeTypeModel::where('announcement_id', $announcement->id)->delete();
            AnnouncementEmployeeStatusModel::where('announcement_id', $announcement->id)->delete();

            // Departments
            foreach ($request->input('departments', []) as $departmentId) {
                AnnouncementDepartmentsModel::create([
                    'announcement_id' => $announcement->id,
                    'department_id' => (int)$departmentId
                ]);
            }

            // Branches
            foreach ($request->input('branches', []) as $branchId) {
                AnnouncementBranchesModel::create([
                    'announcement_id' => $announcement->id,
                    'branch_id' => (int)$branchId
                ]);
            }

            // Roles: For each role, insert for each user in that role
            foreach ($request->input('role_ids', []) as $roleId) {
                // Optional: Add additional filters for branches/departments if you want
                $usersForRole = UsersModel::where('role_id', $roleId)->get();
                foreach ($usersForRole as $targetUser) {
                    AnnouncementEmployeeRoleModel::create([
                        'announcement_id' => $announcement->id,
                        'role_id' => (int)$roleId,
                        'user_id' => $targetUser->id,
                    ]);
                }
            }

            // Employment Types (map name -> id)
            $employmentTypeNames = $request->input('employment_types', []);
            if (!empty($employmentTypeNames)) {
                $typeMap = EmployeeTypeModel::whereIn('name', $employmentTypeNames)->pluck('id', 'name')->toArray();
                foreach ($employmentTypeNames as $typeName) {
                    if (isset($typeMap[$typeName])) {
                        AnnouncementEmployeeTypeModel::create([
                            'announcement_id' => $announcement->id,
                            'employee_type_id' => $typeMap[$typeName],
                        ]);
                    }
                }
            }

            // Employment Statuses (optional: you may want to do per-user here as well)
            foreach ($request->input('employment_statuses', []) as $status) {
                // If you want to target all users with this status:
                // $usersForStatus = UsersModel::where('employment_status', $status)->get();
                // foreach ($usersForStatus as $targetUser) {
                //     AnnouncementEmployeeStatusModel::create([
                //         'announcement_id' => $announcement->id,
                //         'employment_status' => $status,
                //         'user_id' => $targetUser->id,
                //     ]);
                // }
                // Otherwise, just assign to the current user:
                AnnouncementEmployeeStatusModel::create([
                    'announcement_id' => $announcement->id,
                    'employment_status' => $status,
                    'user_id' => $user->id,
                ]);
            }

            DB::commit();

            return response()->json(['status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Error saving: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Internal Server Error'], 500);
        }
    }
}