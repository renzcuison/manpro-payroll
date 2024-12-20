<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoriesViewer;
use App\Models\User;
use App\Models\CategoriesTrainingsQuestion;
use App\Models\CategoriesTrainingsAnswer;
use App\Models\CategoriesEvaluationForm;
use App\Models\CategoriesEvaluationFormRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;


class CategoryMobileController extends Controller
{
    public function fetchUpdates()
    {
        Log::info("Categories fetched");
        try{
            $user = Auth::user();
            // Fetch categories for the user's team and not deleted
            $updates = Category::where('team', $user->team)
                ->where('is_deleted', 0)
                ->where('category', '!=', 'performance evaluations')
                ->orderBy('created_at', 'desc')
                ->get();

            // Fetch 'performance evaluations' updates for the user
            $performanceUpdates = Category::where('category', 'performance evaluations')
                ->where('employee_id', $user->user_id)
                ->where('team', $user->team)
                ->where('is_deleted', 0)
                ->orderBy('created_at', 'desc')
                ->get();

            // Merge the collections
            $updates = $updates->merge($performanceUpdates);

            
            if ($updates->isEmpty()) {
                return response()->json([
                    'announcements' => [],
                    'message' => 'Updates not found'
                ], 404);
            }

            $updates->each(function ($update) {
                $author = User::where('user_id', $update->author_id)->first();
                if ($author) {
                    // Concatenate first name, middle name, and last name with a space, handling null values
                    $full_name_parts = [];
                    if ($author->fname) {
                        $full_name_parts[] = $author->fname;
                    }
                    if ($author->mname) {
                        $full_name_parts[] = $author->mname;
                    }
                    if ($author->lname) {
                        $full_name_parts[] = $author->lname;
                    }
                    $update->author = implode(' ', $full_name_parts);
                } else {
                    $update->author = null; // Handle case where author_id doesn't match any user
                }
                return $update;
            });

            $views = CategoriesViewer::where('user_id', $user->user_id)
                ->pluck('category_id')
                ->toArray();

            $updates->each(function ($update) use ($views) {
                $update->view_count = CategoriesViewer::where('category_id', $update->category_id)->count();
                $update->viewed_by_user = in_array($update->category_id, $views);
            });
                
            Log::info("Updates from database: ", ['updates' => $updates->toArray()]);

            return response()->json([
                'updates' => $updates
            ], 200);
        }catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function fetchAnnouncements()
    {
        Log::info("Announcements fetched");
        try {
            $user = Auth::user();
            $announcements = Category::where('team', $user->team)
                ->where('category', 'announcements')
                ->where('is_deleted', 0)
                ->orderBy('created_at', 'desc')
                ->get();

            if ($announcements->isEmpty()) {
                return response()->json([
                    'message' => 'Announcements not found'
                ], 404);
            }
            
            $announcements->each(function ($announcement) {
                $author = User::where('user_id', $announcement->author_id)->first();
                if ($author) {
                    // Concatenate first name, middle name, and last name with a space, handling null values
                    $full_name_parts = [];
                    if ($author->fname) {
                        $full_name_parts[] = $author->fname;
                    }
                    if ($author->mname) {
                        $full_name_parts[] = $author->mname;
                    }
                    if ($author->lname) {
                        $full_name_parts[] = $author->lname;
                    }
                    $announcement->author = implode(' ', $full_name_parts);
                    $announcement->fname = $author->fname;
                    $announcement->lname = $author->lname;
                    $announcement->profile_pic = $author->profile_pic;
                } else {
                    $announcement->author = null; // Handle case where author_id doesn't match any user
                    $announcement->fname = null;
                    $announcement->lname = null;
                    $announcement->profile_pic = null;
                }

                return $announcement;
            });
            $views = CategoriesViewer::where('user_id', $user->user_id)
                ->pluck('category_id')
                ->toArray();

            $announcements->each(function ($announcement) use ($views) {
                $announcement->view_count = CategoriesViewer::where('category_id', $announcement->category_id)->count();
                $announcement->viewed_by_user = in_array($announcement->category_id, $views);
            });
                
            Log::info("Announcements from database: ", ['announcements' => $announcements->toArray()]);
            
            return response()->json([
                'announcements' => $announcements
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function fetchAnnouncement($id)
    {
        try {
            $user = Auth::user();
            $announcement = Category::where('category_id', $id)->first();

            if($announcement){
                $announcement->author = User::where('user_id', $announcement->author_id)->first();
                return response()->json([
                    'announcement' => $announcement
                ], 200);
            }else{
                return response()->json([
                    'message' => 'Announcement not found'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function fetchTrainings()
    {
        try {
            $user = Auth::user();

            $trainings = Category::where('team', $user->team)
                ->where('category', 'trainings')
                ->where('is_deleted', 0)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($item) {
                    $author = User::where('user_id', $item->author_id)->first();

                    if ($author) {
                        // Concatenate first name, middle name, and last name with a space, handling null values
                        $full_name_parts = [];
                        if ($author->fname) {
                            $full_name_parts[] = $author->fname;
                        }
                        if ($author->mname) {
                            $full_name_parts[] = $author->mname;
                        }
                        if ($author->lname) {
                            $full_name_parts[] = $author->lname;
                        }
                        $item->author = implode(' ', $full_name_parts);
                    } else {
                        $item->author = null; // Handle case where author_id doesn't match any user
                    }

                    return $item;
                });

            $views = CategoriesViewer::where('user_id', $user->user_id)
                ->pluck('category_id')
                ->toArray();

            Log::info("Trainings from database: ", ['trainings' => $trainings->toArray()]);
                
            if ($trainings) {
                return response()->json([
                    'trainings' => $trainings,
                    'views' => $views
                ], 200);
            } 
            else {
                return response()->json([
                    'message' => 'Trainings not found'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateUpdatesViewCount(Request $request)
    {
        Log::info("Viewer count recorded", ['request' => $request]);
        try{
            $user = Auth::user();
            $validator = Validator::make($request->all(), [
                'category_id' => 'required|numeric',
            ]);

            $existingViewer = CategoriesViewer::where('user_id', $user->user_id)
                ->where('category_id', $request->category_id)
                ->first();

            if ($existingViewer) {
                return response()->json([
                    'message' => 'Viewer already recorded for this category',
                    'viewer' => $existingViewer,
                ], 200);
            }

            $data = $validator->validated();
            $data['user_id'] = $user->user_id;
            $data['team'] = $user->team;
            $data['created_at'] = now();

            $viewer = CategoriesViewer::create($data);
            
            if ($viewer) {
                return response()->json(
                    [
                        'viewer' => $viewer,
                        'message' => 'Viewer recorded',
                    ],
                    201,
                );
            }
        } catch (\Exception $e) {
            return response()->json(
                [
                    'error' => 'An error occurred',
                    'message' => $e->getMessage(),
                ],
                500,
            );
        }
    }

    public function getQuestions($id)
    {
        try {
            $user = Auth::user();
            
            // Ensure user is authenticated
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized',
                    'message' => 'User is not authenticated'
                ], 401);
            }
            
            // Fetch questions
            $questions = CategoriesTrainingsQuestion::where('category_id', $id)->get();
            
            // Check if questions exist
            // if ($questions->isEmpty()) {
            //     return response()->json([
            //         'message' => 'Questions not found for this category'
            //     ], 404);
            // }

            Log::info('ID:'. $id);

            // Fetch answers for these questions
            $answers = CategoriesTrainingsAnswer::where('category_id', $id)
                ->where('user_id', $user->user_id)
                ->get();
            
            $userScore = null;
            $totalScore = null;
    
            // Calculate userScore and totalScore if answers exist
            if (!$answers->isEmpty()) {
                $userScore = $answers->sum('checking');
                $totalScore = $questions->count();
            }
            
            return response()->json([
                'questions' => $questions,
                'answers' => $answers,
                'userScore' => $userScore,
                'totalScore' => $totalScore
            ], 200);
            
        } catch (\Exception $e) {
            // Log the exception
            Log::error('Exception occurred: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function storeAnswers(Request $request)
    {
        try {
            // Get the authenticated user
            $user = Auth::user();

            // Retrieve JSON data from request
            $answers = $request->input(); // Assuming the JSON data is passed directly as an array

            foreach ($answers as $answer) {
                // Create the answer record
                $createdAnswer = CategoriesTrainingsAnswer::create([
                    'answer_text' => $answer['answer_text'],
                    'category_id' => $answer['category_id'],
                    'question_id' => $answer['question_id'],
                    'user_id' => $user->user_id,
                    'team' => $user->team,
                    // Add other fields as necessary
                ]);

                // Optional: Check if answer_text matches answer_key in CategoriesTrainingsQuestion
                // This step is optional and depends on your application logic
                $question = CategoriesTrainingsQuestion::find($answer['question_id']);
                if ($question && $answer['answer_text'] === $question->answer_key) {
                    $createdAnswer->update(['checking' => 1]);
                }
                else {
                    $createdAnswer->update(['checking' => 0]);
                }
            }

            return response()->json(['message' => 'Answers stored successfully'], 201);
        } catch (\Exception $e) {
            // Log the exception for debugging
            \Log::error('Error storing answers: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to store answers'], 500);
        }
    }
    public function fetchPerformance()
    {
        Log::info("Performance page fetched");
        try {
            $user = Auth::user();
            $performance = Category::where('employee_id', $user->user_id)
                ->where ('team', $user->team)
                ->where('category', 'performance evaluations')
                ->where('is_deleted', 0)
                ->orderBy('created_at', 'desc')
                ->get();

                Log::info("Fetched performance data: ", ['performance' => $performance->toArray()]);

            $performance->each(function ($performance) {
                $employee = User::where('user_id', $performance->employee_id)->first();
                $performance->employee = $employee;

                $evaluator = User::where('user_id', $performance->evaluator_id)->first();
                $performance->evaluator = $evaluator;
            });

            $views = CategoriesViewer::where('user_id', $user->user_id)
            ->pluck('category_id')
            ->toArray();

            $performance->each(function ($performance) use ($views) {
                $performance->view_count = CategoriesViewer::where('category_id', $performance->category_id)->count();
                $performance->viewed_by_user = in_array($performance->category_id, $views);
            });
        
            if ($performance) {
                return response()->json([
                    'performance' => $performance
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Performance Evaluations not found'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }

        
    }

    public function fetchPerformanceDetails($id)
    {
        $user = Auth::user();

        $category = Category::where('category_id', $id)
            ->where('team', $user->team)
            ->orderBy('category_id', 'ASC')
            ->get();
            Log::info("category fetched", ['category'=>$category]);

        $performance = CategoriesEvaluationForm::where('category_id', $id)
            ->where('team', $user->team)
            ->orderBy('evaluation_id', 'ASC')
            ->get();
            Log::info("pefromance fetched", ['pefroance'=>$performance]);

        $ratings = CategoriesEvaluationFormRating::where('category_id', $id)
            ->where('team', $user->team)
            ->orderBy('rate_form_id', 'ASC')
            ->get();
            Log::info("ratings fetched", ['ratings'=>$ratings]);

            return response()->json([
                'performance' => $performance,
                'ratings' => $ratings,
                'category' => $category,
            ]);
    }

    public function storeSignature(Request $request, $id)
    {
        try {
            // Validate the request
            $request->validate([
                'signature' => 'required|string',
            ]);
    
            // Decode the base64 string to get the image data
            $base64Image = $request->input('signature');
            $base64Image = substr($base64Image, strpos($base64Image, ',') + 1); 
            $imageData = base64_decode($base64Image);
    
            // Generate a unique filename for the image
            $filename = 'performance_evaluation_signature_' . $id . '.png';
    
            // Store the image file in storage/app/public/signatures directory
            Storage::disk('public')->put($filename, $imageData);
    
            // Update the 'signature' column in hr_payroll_allrecords table
            $categoryRecord = Category::where('category_id', $id)->firstOrFail();
            $categoryRecord->signature = $filename; // Assuming 'signature' is the column name
            $categoryRecord->save();
    
            return response()->json([
                'message' => 'Signature uploaded and linked to payroll record successfully.',
                'filename' => $filename, // Optional: Return filename for client-side reference
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in storeSignature', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'An error occurred while storing the signature.',
            ], 500);
        }
    }
}
