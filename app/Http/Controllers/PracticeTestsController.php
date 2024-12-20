<?php

namespace App\Http\Controllers;

use App\Models\PracticeTest;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PracticeTestsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $contact_id = $user->contact_id;
        
        $tests = PracticeTest::select('pt_bank_id', 'title', 'points', 'date_created', 'created_by', 'is_deleted')
        ->where("is_deleted", 0)->get();

        $last_attempts = DB::table('pt_result')
        ->selectRaw("Max( pt_result.date_completed ) AS datetime, test_id")
        ->where('pt_result.client_id', DB::raw($contact_id))
        ->groupBy('test_id')
        ->get();
        return response([
					"success" => 1,
					"tests" => $tests,
                    "last_attempts" => $last_attempts
				]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request,$id)
    {
        $user = $request->user();
        $contact_id = $user->contact_id;

        // get test's questions
        $question_row = Question::select('pt_ques_id','question','category','type','explanation','order_by', 'category_name')
            ->leftJoin('pt_question_cat', 'pt_question_cat.pt_ques_cat_id', '=', 'pt_questions.category')
            ->where('pt_bank_id', $id)
            ->where('is_removed', 0)
            ->get()
            ->toArray();

        $questions = array_map(function ($question) use ($contact_id) {
            $options = DB::table('pt_question_opt')
                ->where('question_id' , $question['pt_ques_id'])
                ->inRandomOrder()->get();

            $answers = DB::table('pt_answers')
                ->where('client_id' , DB::raw($contact_id))
                ->where('question_id', $question['pt_ques_id'])
                ->where('is_old', 0)
                ->orderBy('answer_id', 'DESC')
                ->get();

            $question['options'] = $options;
            $question['answers'] = $answers;
            return $question;
        }, $question_row);

        // get last attempt

        $last_attempt = $this->getLastAttemptDate($id,$contact_id);

        return array(
            'success' => 1,
            'questions' => $questions,
            'lastAttempt' => $last_attempt,
            'testId' => $id
        );
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function showResult(Request $request, $id)
    {
        $user = $request->user();
        $contact_id = $user->contact_id;

        $answer_rows = DB::table('pt_result')
        ->select('result')
        ->where('test_id', $id)
        ->where('client_id', DB::raw($contact_id))
				->orderByDesc('date_completed')
				->limit(1)
				->first();

        return array(
            'success' => 1,
            'result' => $answer_rows->result
        );
    }



		public function correctAnswerCount(Request $request, $id) {

			$contact_id = $request->user()->contact_id;

			$results = DB::table("pt_questions")
				->selectRaw("(SELECT pt_answers.is_correct FROM pt_answers WHERE pt_answers.question_id = pt_questions.pt_ques_id AND pt_answers.client_id = ? ORDER BY pt_answers.is_correct ASC LIMIT 1 ) AS res", array($contact_id))
				->where([
					["pt_questions.pt_bank_id", $id],
					["pt_questions.is_removed", 0]
				])->get()->toArray();

				$correctCount = array_filter($results, function($result) {
					return $result->res === 1;
				});

			return response([
				"success" => 1,
				"correctCount" => $correctCount
			]);
		}


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function submitAnswer(Request $request)
    {
        $contact_id = $request->user()->contact_id;
				$fields = $request->validate([
					"ques_id" => "required|integer",
					"option_radios" => "required|array"
				]);
        $ques_id = $fields["ques_id"];
        $options = $fields['option_radios'];
				
        try {
            if ($ques_id && $options > 0){
                $results = array_map(function ($option) use ($contact_id, $ques_id) {
                    DB::table('pt_answers')->insert([
                        'client_id' => DB::raw($contact_id),
                        'question_id' => $ques_id,
                        'option_id' => $option['ques_opt_id'],
                        'is_correct' => $option['is_right']
                    ]);
                }, $options);
                return response($results, 200);
            }
        }catch (\Exception $e){
            return $e;
        }
    }
		
    public function updateResult(Request $request) 
    {
        $fields = $request->validate([
            "testId" => "required|integer",
            "rate" => "required",
            "questionsIds" => "required|array"
        ]);

        // dd($fields);
        $contact_id = $request->user()->contact_id;

        DB::table("pt_result")->insert([
            "client_id" => $contact_id,
            "test_id" => $fields["testId"],
            "result" => $fields["rate"]
        ]);

        foreach ($fields["questionsIds"] as $questionId) {
            DB::table("pt_answers")->where("client_id", DB::raw($contact_id))->update(["is_old" => 1]);
        }

        return response([
            "success" => 1,
            "testId" => $fields["testId"],
            "rate" => $fields["rate"],
            "questionsIds" => $fields["questionsIds"]
        ]);

    }

    public function getLastAttemptDate($test_id, $contact_id)
    {
        $last_attempt = DB::table('pt_result')
					->selectRaw("Max( pt_result.date_completed ) AS datetime")
					->where('pt_result.test_id', $test_id)
					->where('pt_result.client_id', DB::raw($contact_id))
					->first();

        return $last_attempt;
    }


}