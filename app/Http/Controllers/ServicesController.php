<?php

namespace App\Http\Controllers;

use App\Models\Field;
use App\Models\FieldChild;
use App\Models\FinanceDiscount;
use App\Models\FinanceField;
use App\Models\FinancePhase;
use App\Models\FinanceTransaction;
use App\Models\RequirementField;
use App\Models\RequirementChild;
use App\Models\RequirementValue;
use App\Models\ServicesStatusStepsAssigned;
use App\Models\SpaceDBTable;
use App\Models\Status;
use App\Models\Space;
use App\Models\ServicesStep;
use App\Models\Task;
use App\Models\TaskTag;
use App\Models\ListModel;
use App\Models\User;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

use Carbon\Carbon;

class ServicesController extends Controller
{
    public function index(Request $request)
	{
		$user  = $request->user();
		$tasks = Task::selectRaw('task.task_id, task.task_name, list.list_id, list.list_name, space.space_id, space.space_name, status.status_id, status.status_name, status_color, status.status_order_no')
		->where('task_contact', $user->contact_id)
		->leftJoin('list', 'list.list_id', '=', 'task.task_list_id')
		->leftJoin('space', 'space.space_id', '=', 'list.list_space_id')
		->leftJoin('status', 'status.status_id', '=', 'task.task_status_id')
		->orderBy('task_date_created')
		->get();

		if($tasks->count() > 0) {
			foreach ($tasks as $idx => $task) {
				$tasks[$idx]->showStatus = false;
						$allowed_status   = Status::SelectRaw('status.status_name, tbl_status_details.status_details_id')
				->leftJoin('tbl_status_details', 'tbl_status_details.status_id', '=', 'status.status_id')
				->where([
					['tbl_status_details.contact_id', '=', $user->contact_id],
					['tbl_status_details.status_list_id', '=', $task->list_id],
					['tbl_status_details.task_id', '=', $task->task_id],
				])
				->get()
				->count();

				$status_count = Status::where('status_list_id', $task->list_id)->get()->count();
				$tasks[$idx]->statusCount = $status_count;

				if($allowed_status > 0){
					$tasks[$idx]->showStatus = true;
				}
			}
		}

		return response([
			'tasks' => $tasks
		]);
	}

	public function allRequirements($taskId) {
		$requirements = RequirementField::selectRaw('requirement_field.requirement_name, requirement_value.value_id, requirement_value.value_by, requirement_value.value_to, requirement_value.value_field_id, requirement_value.value_value as value, ( SELECT requirement_child.child_name FROM requirement_child WHERE requirement_child.child_id = value LIMIT 1 ) as subvalue')
		->leftJoin('requirement_value', 'requirement_value.value_field_id', '=', 'requirement_field.requirement_id')
		->where('requirement_value.value_to', '=', $taskId)
		->orWhere('requirement_value.value_to', 'IS', NULL)
		->orderBy('requirement_order_no')
		->get();

		return response([
			'requirements' => $requirements
		]);
	}


	public function allFields($spaceId) {
		$field = Field::leftJoin('child', 'child.child_field_id', '=', 'field.field_id')
		->where('field.field_space_id', $spaceId)
		->orderBy('field.field_order', 'ASC')
		->get();

		return response([
			'success' => 1,
			'field'   => $field
		]);
	}


	public function financePhaseBySpaceId(Request $request, $spaceId) {
		$user          = $request->user();
		$finance_phase = FinancePhase::selectRaw('finance_phase.phase_id, finance_phase.phase_space_id, finance_phase.phase_name, tbl_hide_payment_phase.contact_id, tbl_hide_payment_phase.hide_phase_id')
		->leftJoin('tbl_hide_payment_phase', function($join) use ($user) {
			$join->on('tbl_hide_payment_phase.contact_id', FinancePhase::raw($user->contact_id));
			$join->on('tbl_hide_payment_phase.phase_id', 'finance_phase.phase_id');
		})
		->where('finance_phase.phase_space_id', '=', $spaceId)
		->get()
		->toArray();

		$finance_no_hidden_phase = array_filter($finance_phase, function($phase) {
			return $phase['hide_phase_id'] === null;
		});

		return response(array_values($finance_no_hidden_phase));
	}


	public function allProcedures(Request $request) {
		$fields = $request->validate([
			"listId" => "required|integer",
			"taskId" => "required|integer",
		]);

		$contact_id = $request->user()->contact_id;

		$procedures = ServicesStatusStepsAssigned::selectRaw('tbl_services_status_steps_assigned.step_id, tbl_services_steps.step_name')
		->join('tbl_services_steps', 'tbl_services_steps.service_step_id', '=', 'tbl_services_status_steps_assigned.step_id')
		->join('status', 'status.status_id', '=', 'tbl_services_status_steps_assigned.status_id')
		->join('tbl_status_details', 'tbl_status_details.status_id', '=', 'status.status_id')
		->where('tbl_services_steps.list_id', $fields['listId'])
		->where('tbl_status_details.task_id', $fields['taskId'])
		->where('tbl_status_details.contact_id', $contact_id)
		->groupBy('tbl_services_steps.service_step_id')
		->get();

		$statuses = Status::selectRaw('status.status_id, status.status_order_no, status.status_name, status.status_list_id, status.status__date_created, status.status_color, tbl_status_details.STATUS, tbl_services_status_steps_assigned.step_id')
		->join('tbl_status_details', 'tbl_status_details.status_id', '=', 'status.status_id')
		->join('tbl_services_status_steps_assigned',  'status.status_id', '=', 'tbl_services_status_steps_assigned.status_id')
		->where('tbl_status_details.status_list_id', $fields['listId'])
		->where('tbl_status_details.contact_id', $contact_id)
		->where('tbl_status_details.task_id', $fields['taskId'])
		->orderBy('status.status_order_no')
		->get();

		return response([
			"procedures" => $procedures,
			'statuses'   => $statuses
		]);
	}


	public function getPaymentTransaction(Request $request) {
		$fields = $request->validate([
			"phaseId" => "required|integer",
			"taskId"  => "required|integer",
		]);

		$fees = FinanceField::selectRaw('finance_field.finance_name, finance_field.finance_currency, finance_field.finance_value, finance_field.finance_id, custom_amount_id, custom_amount_task_id, custom_amount_field_id, custom_amount_value')
		->leftJoin('finance_field_ca', function($join) use ($fields) {
			$join->on('finance_field_ca.custom_amount_task_id', '=', FinanceField::raw($fields['taskId']));
			$join->on('finance_field_ca.custom_amount_field_id', 'finance_field.finance_id');
		})
		->where('finance_field.finance_phase_id', $fields['phaseId'])
		->whereNotIn('finance_field.finance_phase_id', function ($query) use ($fields) {
			$query->selectRaw('hideshow_id')
			->from('finance_field_hide')
			->where([
				['hideshow_field_id', 'finance_field.finance_id'],
				['hideshow_task_id', $fields['taskId']]
			]);
		})
		->orderBy('finance_order')
		->get();

		$transactions = FinanceTransaction::selectRaw('finance_transaction.val_id, finance_transaction.val_date, finance_transaction.val_transaction_no, finance_transaction.val_currency, finance_transaction.val_amount, finance_transaction.val_charge, finance_transaction.val_initial_amount, finance_transaction.val_usd_rate, finance_transaction.val_usd_total, finance_transaction.val_php_rate, finance_transaction.val_php_total, finance_transaction.val_client_rate, finance_transaction.val_client_total, finance_transaction.val_remarks')
		->where('finance_transaction.val_phase_id', $fields['phaseId'])
		->where('finance_transaction.val_assign_to', $fields['taskId'])
		->orderBy('finance_transaction.val_date', 'DESC')
		->get();

		$discount = FinanceDiscount::selectRaw('discount_amount')
			->where('discount_phase_id', $fields['phaseId'])
			->where('discount_assign_to', $fields['taskId'])
		->first();

		return response([
			"fees"         => $fees,
			"transactions" => $transactions,
			"discount"     => $discount
		]);
	}


	public function getSpaces(Request $request) {
		$fields = $request->validate([
			"spaceId" => "required|integer",
			"taskId"  => "required|integer",
			
		]);

		$space    = SpaceDBTable::selectRaw('space_db_table')->where('space_id', $fields['spaceId'])->first();
		$response = [
			"space"      => $space,
			"spaceTable" => []
		];
		if($space->count() > 0) {
			$space_table            = DB::table($space['space_db_table'])->where('task_id', $fields['taskId'])->first();
			$response["spaceTable"] = $space_table;
		}

		return response($response);
	}

	public function getListData($list_id) {
		
		$steps = ServicesStep::where('list_id', $list_id)->where('is_deleted', 0)->get();

		$data = array();

		foreach ($steps as $step){

			$statuses = DB::table('tbl_services_status_steps_assigned')
							->join('status','status.status_id', '=', 'tbl_services_status_steps_assigned.status_id')
							->where('tbl_services_status_steps_assigned.step_id', $step->service_step_id)
							->select('status.status_id','status.status_name','tbl_services_status_steps_assigned.step_id','status.status_color')
							->orderBy('status.status_order_no')
							->get();

			$data[] = [
				'step_id'   => $step->service_step_id,
				'step_name' => $step->step_name,
				'statuses'  => $statuses
			];
		}

		return response($data);
	}

	public function getClientsByStatus($status_id) {
		
		$data = array();

		$tasks = DB::table('task')
		->where('task_status_id', $status_id)
		->get();

		foreach($tasks as $task){
			  // get the recent date of the task was updated via comments.
			$due_date = $this->getDateUpdated($task->task_id)->comment_date ?? ''; 

			// get tags
			$tags = $this->getTaskTags($task->task_tag);

			// get assigned users to a task
			$assigned_users = $this->getTaskAssignedUsers($task->task_assign_to);

			$data[] = [
				'task'         => $task,
				'date_updated' => $due_date,
				'tags'         => $tags,
				'assigned_users' => $assigned_users
			];
		}

		return response()->json($data);
	}

	public function getTaskData($task_id)
	{

		$task = Task::find($task_id);

		// get the recent date of the task was updated via comments.
		$due_date = $this->getDateUpdated($task_id)->comment_date ?? ''; 

		// get tags
		$tags = $this->getTaskTags($task->task_tag);

		// get assigned users to a task
		$assigned_users = $this->getTaskAssignedUsers($task->task_assign_to);

		  // get contact details
		$contact = Contact::find($task->task_contact);

		return response()->json([
			'task'           => $task,
			'date_updated'   => $due_date,
			'tags'           => $tags,
			'assigned_users' => $assigned_users,
			'contact'        => $contact
		]);
	}

	// get recent date of comment update of a task
	public static function getDateUpdated($task_id)
	{
		$comments = DB::table('comment')
		->where('comment_task_id', $task_id)
		->orderByDesc('comment_date')
		->select('comment_date')
		->limit(1)
		->first();

		return $comments;
	}

	
	// function for fetching assigned users to a task
	public function getTaskAssignedUsers($task_assign_to)
	{
		$assigned_user_ids = explode(",", $task_assign_to);
		$assigned_users = array();
		foreach ($assigned_user_ids as $user_id) {
			$assigned_users[] = User::where("user_id",$user_id)->select('user_id','fname','mname','lname')->first();
		}

		return $assigned_users;
	}

	// function for fetching tags of a task
	public function getTaskTags($task_tag)
	{
		$tag_ids = explode(",",$task_tag);
		$tags = array();
		foreach ($tag_ids as $tag_id) {
			if ($tag_id) {
				$tag = DB::table('tags')->where('tag_id', $tag_id)->select('tag_name', 'tag_color')->first();
				$tags[] = [
					'tag_name' => $tag->tag_name,
					'tag_color' => $tag->tag_color
				];
			}
		}

		return $tags;
	}
	// Show Tag
	public function showTag($id){
		$tag = TaskTag::findOrFail($id);
		return response()->json($tag);
	}

	// Delete Tag
	public function deleteTag($id){
		try {
			$delete = TaskTag::findOrFail($id)->delete();

			return response()->json(['message' => 'Successgully deleted Tag']);
		} catch (\Throwable $th) {
			return response()->json(['message' => 'Tag not delete', 'error' => 'error deleting tag'], 500);
		}
	}

	// Update Tag name
	public function updateTag(Request $request){
		if(!empty($request->tag_name)){
			TaskTag::find($request['tagId'])->update([
				"tag_name" => $request->tag_name,
			]);
			return response()->json(['message' => 'Updated tag name']);
		}else{
			return response()->json(['message' => 'Unable to update tag name', 'error'=>'Something went wrong'], 500);
		}
	}

	// Create new tag
	public function createTag(Request $request)
	{
		try {
			$request->validate([
				'listId' => 'required|integer',
				'tag' => 'required'
			]);

			$color = $this->generateRandomColor();

			DB::beginTransaction();

			$tag = TaskTag::create([
				'tag_name' => $request->tag,
				'tag_list_id' => $request->listId,
				'tag_color' => $color
			]);

			DB::commit();

			return response()->json(['message' => 'Tag created successfully', 'data' => $tag], 200);
		} catch (\Exception $e) {
			DB::rollback();
			return response()->json(['message' => 'Failed to create tag', 'error' => $e->getMessage()], 500);
		}
	}

	private function generateRandomColor()
	{
		$red = str_pad(dechex(rand(120, 200)), 2, "0", STR_PAD_LEFT);
		$green = str_pad(dechex(rand(120, 200)), 2, "0", STR_PAD_LEFT);
		$blue = str_pad(dechex(rand(120, 200)), 2, "0", STR_PAD_LEFT);

		return "#$red$green$blue";
	}


	// Add step name
	public function addStep(Request $request){
		$user  = $request->user();
		$step_name = $request->stepName;
		$list_id = $request->list_id;
		
		if(!empty($request->stepName)){
			try {
				DB::beginTransaction();
	
				$step = ServicesStep::create([
					'step_name' => $step_name,
					'user_id_created' => $user->user_id,
					'list_id' =>$list_id
				]);
	
				DB::commit();
				return response()->json(['message' => 'Step created successfully', 'data' => $step]);
				
		} catch (\Exception $e) {
			DB::rollback();
			return response()->json(['message' => 'Failed to create step', 'error' => $e->getMessage()], 500);
			}
		}
	}
	// Update step name
	public function updateStep(Request $request){
		if(!empty($request->newName)){
			ServicesStep::find($request['stepId'])->update([
				"step_name" => $request->newName,
			]);
			return response()->json(['message' => 'Updated step name']);
		}else{
			return response()->json(['message' => 'Unable to update step name', 'error'=>'Something went wrong'], 500);
		}
	}
	// Delete step name
	public function deleteStep($id){
		try {
			ServicesStep::find($id)->delete();
			
			return response()->json(['message' => 'Successfully deleted step']);
		}catch(Exception $e){
			return response()->json(['message' => 'Unable to delete step', 'error'=>$e], 500);
		}
	}

	public function showFieldByServiceId($id){
		return Field::where('field_space_id',$id)->orderBy('field_order', 'asc')->get();
	}
	
	public function sortFields(Request $request){
		try {
			$id_array = $request->input('fieldIds');
	
			foreach ($id_array as $key => $id) {
				Field::find($id)->update(['field_order' => $key+1]);
			}

			return response()->json(['message' => 'Successfully sorted fields']);
		} catch (\Throwable $th) {
			return response()->json([
                'message' => 'Failed to sort fields.',
                'error' => $th->getMessage(),
            ], 500);
		}
	}

	public function updateField(Request $request)
	{
		$name = $request->input('fieldName');
		$id = $request->input('fieldId');
		try {
			Field::find($id)->update(['field_name' => $name]);
			return response()->json(['message' => 'Successfully updated field']);
		} catch (\Throwable $th) {
			return response()->json([
                'message' => 'Failed to update field.',
                'error' => $th->getMessage(),
            ], 500);
		}
	}

	public function addField(Request $request){
		
		try {	
			
			$dateToday = Carbon::today()->toDateString();
			$dateTime = Carbon::today()->toDateTimeString();
			$name = $request->input('name');
			$type = $request->input('type');
			$serviceId = $request->input('serviceId');
			$count = $request->input('count');			
			$col_name = $name.'_'.$dateTime;
			
			$service = Space::find($serviceId);

			if (!$service) {
				return response()->json(['message' => 'Service id not found'], 404);
			}
			
			$service_table = $service->space_db_table;

			$field = Field::create([
				'field_name' => $name,
				'field_space_id' => $serviceId,
				'field_type' => $type,
				'field_date_create' => $dateToday,
				'field_col_name' => $col_name,
				'field_order' => $count
			]);

			if (!$field) {
				return response()->json(['message' => 'Failed to insert field to db'], 500);
			}

			Schema::table($service_table, function (Blueprint $table) use ($col_name, $type) {
				if ($type === 'Textarea') {
					$table->text($col_name);
				} elseif ($type === 'Date') {
					$table->date($col_name);
				} else {
					$table->string($col_name);
				}
			});

			return response()->json(['success' => true,'message' => 'Successfully added new field']);
		} catch (\Exception $th) {
			return response()->json(['message' => 'Failed to add new field', 'error' => $th->getMessage()], 500);
		}
	}

public function deleteField($id)
{
    try {
        $field = Field::findOrFail($id);
        $field_name = $field->field_name;
        $field_col_name = $field->field_col_name;
        $service_id = $field->field_space_id;

        $service = Space::findOrFail($service_id);
        $table = $service->space_db_table;

        if ($field->field_type === 'Dropdown') {
            $field_options = FieldChild::where('child_field_id', $id)->delete();
        }

        // Check if column exists in table
        $tableExists = Schema::hasColumn($table, $field_col_name);
        if ($tableExists) {
            $custom_table = DB::table($table)->where($field_col_name, '!=', '')->get();
            if ($custom_table) {
                $field->delete();
                Schema::table($table, function ($table) use ($field_col_name) {
                    $table->dropColumn($field_col_name); // Delete the column
                });
            } else {
                return response()->json(['message' => 'Cannot delete field with value.', 'error' => 'Failed to delete field'], 500);
            }
        } else {
            $field->delete();
        }


        return response()->json(['success' => true, 'message' => 'Successfully deleted field']);
    } catch (\Exception $th) {
        return response()->json(['message' => 'Failed to delete field', 'error' => $th->getMessage()], 500);
    }
}


	public function fetchFieldOptions($field_id){
		try {
			$options = FieldChild::where('child_field_id', $field_id)->get();

			return response()->json($options);
		} catch (\Throwable $th) {
			return response()->json(['error' => $th],500);
		}
	}
	
	public function deleteFieldOptions($option_id){
		try {
			$options = FieldChild::find($option_id)->delete();

			return response()->json(['message' => 'Successfully deleted option']);
		} catch (\Throwable $th) {
			return response()->json(['message' => 'Failed to delete option','error' => $th],500);
		}
	}

	public function updateOptionFieldname(Request $request){
		try {
			$request->validate([
				'optId' => 'required',
				'optionName' => 'required'
			]);
			
			FieldChild::find($request['optId'])->update(['child_name' => $request['optionName']]);

			return response()->json(['message' => 'Successfully updated option name']);
		} catch (\Throwable $th) {
			return response()->json(['error' => $th],500);
		}
	}
	public function updateOptionFieldIcon(Request $request){
		try {
			$request->validate([
				'optId' => 'required',
				'icon' => 'required'
			]);
			
			FieldChild::find($request['optId'])->update(['child_color' => $request['icon']]);

			return response()->json(['message' => 'Successfully updated option icon']);
		} catch (\Throwable $th) {
			return response()->json(['error' => $th],500);
		}
	}

	public function addOptionField(Request $request){

		try {
			$field_option = $request->validate([
				'child_name' => 'required',
				'child_color' => 'required',
				'child_field_id' => 'required',
				'child_order' => 'required'
			]);

			$data = FieldChild::create($field_option);
			
			return response()->json(['message' => 'Successfully added option field', 'data' => $data]);
		} catch(\Exception $e){
			return response()->json(['error' => $e->getMessage()],500);
		}
		// catch (\Throwable $th) {
		// 	return response()->json(['error' => $th],500);
		// }
	}
	
	// USER SERVICE FUNCTIONS
	public function getServices(){
		return Space::all();
	}
	
	public function getServicesWithLists()
	{
		$services = Space::with('lists')->orderBy('position_order', 'asc')->get();

		return response()->json($services);
	}

	/**
	 * Fetch Service data by id
	 *
	 * @param Space $space
	 * @return json
	 */
	public function show($id){
		$service = Space::with('lists')->find($id);
		$service->lists->map(function($list){
			if(!empty($list->list_id)){				
				$date = Carbon::parse($list->list_date_created);
				$formattedDate = $date->toDateString();
				$list->list_date_created = $formattedDate;
			}
		});
		return response()->json($service);
	}

	/**
	 * Fetch Service List data by id
	 *
	 * @param int
	 * @return json
	 */
	public function showList($id){
		$list = ListModel::with('steps')->find($id);
		return response()->json($list);
	}

	/**
	 * Create new Requirement Option
	 *
	 * @param Request $request
	 * @return json
	 */
	public function createReqOption(Request $request)
	{
		try {
			// Validate the request data
			$validatedData = $request->validate([
				'requirementId' => 'required',
				'name' => 'required'
			]);

			// Insert the requirement child record
			RequirementChild::create([
				'child_name' => $validatedData['name'],
				'child_field_id' => $validatedData['requirementId'],
			]);

			// Return success response
			return response()->json([
				'status' => 'success',
			]);
		} catch (\Exception $e) {
			// Return error response if an exception occurs
			return response()->json([
				'status' => 'error',
				'message' => 'An error occurred while creating the requirement option. -'. $e,
			], 500);
		}
	}

	public function deleteRequirementOption($id)
    {
        try {
            $service = RequirementChild::findOrFail($id);
            $service->delete();

            return response()->json(['message' => 'Item deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete item'], 500);
        }
    }

	public function deleteRequirementField($id)
	{
		$requirementField = RequirementField::find($id);
		$type = $requirementField->requirement_type;

		// Check if any transactions exist for the field
		$count = RequirementValue::where('value_field_id', $id)->first();

		if ($count) {
			// Cannot delete any field if it has transactions under specific phase
			\DB::transaction(function () use ($id, $type) {
				// Delete values and related children using eager loading
				RequirementValue::where('value_field_id', $id)->delete();

				if ($type == "Dropdown") {
					RequirementChild::where('child_field_id', $id)->delete();
				}

				// Delete the field
				$requirementField->delete();
			});

			return response()->json(['message'=>'Field deleted and values']);
		} else {
			// No transactions, proceed with the deletion
			if ($type == "Dropdown") {
				// Check if dropdown to delete child options
				RequirementChild::where('child_field_id', $id)->delete();
			}

			// Delete the field
			$requirementField->delete();

			return response()->json(['message'=>'Field deleted and values']);
		}
	}

	/**
     * Add a new requirement.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addNewRequirement(Request $request)
    {
        try {
            // Validate the request data
            $requirement = $request->validate([
                'requirementName' => 'required',
				'requirementType' => 'required',
				'requirementPrivacy' => 'required',
				'serviceId' => 'required'
            ]);

            // Create a new requirement
            RequirementField::create([
				'requirement_name' => $requirement['requirementName'],
				'requirement_space_id' => $requirement['serviceId'],
				'requirement_type' => $requirement['requirementType'],
				'requirement_privacy' => $requirement['requirementPrivacy'],
			]);

            // Return a success response
            return response()->json(['message' => 'Requirement added successfully'], 200);
        } catch (QueryException $exception) {
            // Return an error response if there's a database error
            return response()->json(['message' => 'Failed to add the requirement'], 500);
        } catch (\Exception $exception) {
            // Return a general error response for other exceptions
            return response()->json([
				'message' => 'An error occurred while adding the requirement',
				'error' => $exception->getMessage(),
				'data' => $request
			], 500);
        }
    }


	/**
	 * Create new List
	 *
	 * @param Request $request
	 * @return json
	 */
	public function createList(Request $request){
        $dateToday = Carbon::today()->toDateString();

		$list_title = $request->name;
		$service_id = $request->service_id;

		ListModel::insert([
			'list_name' => $list_title,
			'list_space_id'=> $service_id,
			'list_date_created' => $dateToday
		]);
		
		return response(['status' => 'success']);
		
	}

	/**
	 * Update Service name
	 * 
	 * @param Request $request
	 * @return response
	 */

	 public function updateServiceName(Request $request){
		$request->validate([
            'service_id' => 'required',
            'name' => 'required'
        ]);
		Space::where('space_id', '=', $request->service_id)->update(['space_name' => $request->name]);
        return response(['status' => 'success']);
	 }
	/**
	 * Update List name
	 * 
	 * @param Request $request
	 * @return response
	 */

	 public function updateListName(Request $request){
		$request->validate([
            'list_id' => 'required',
            'name' => 'required'
        ]);
		ListModel::where('list_id', '=', $request->list_id)->update(['list_name' => $request->name]);
        return response(['status' => 'success']);
	 }

	/**
	 * Update Requirement name
	 * 
	 * @param Request $request
	 * @return response
	 */

	 public function updateRequirementName(Request $request){
		$request->validate([
            'requirement_id' => 'required',
            'requirement_name' => 'required'
        ]);
		RequirementField::where('requirement_id', '=', $request->requirement_id)->update(['requirement_name' => $request->requirement_name]);
        return response(['status' => 'success']);
	 }
	/**
	 * Update Requirement option name
	 * 
	 * @param Request $request
	 * @return response
	 */
	public function updateRequirementOption(Request $request)
	{
		$request->validate([
			'optionId' => 'required|integer',
			'child_name' => 'required|string'
		]);

		$option = RequirementChild::where('child_id',$request->optionId);
		$option->update(['child_name' => $request->child_name]);

		return response()->json(['message' => 'Option updated successfully']);
	}

	
	public function saveSortedRequirements(Request $request)
    {
        // Get the sorted requirements from the request
        $sortedRequirements = $request->input('sortedRequirements');

        // Perform the necessary operations to save the sorted requirements
        // For example, update the order field in your database table

        // Assuming you have a Requirement model and a `order` column in your table
        foreach ($sortedRequirements as $index => $requirementId) {
            $requirement = RequirementField::find($requirementId);
            $requirement->requirement_order_no = $index + 1; // Assuming the order starts from 1
            $requirement->save();
        }

        // Return a response indicating the success
        return response()->json(['message' => 'Requirements sorted successfully']);
    }

	public function sortStatuses(Request $request)
    {
        // Get the sorted requirements from the request
        $sortedStatuses = $request->input('sortedStatuses');

        // Perform the necessary operations to save the sorted requirements
        // For example, update the order field in your database table

        // Assuming you have a Requirement model and a `order` column in your table
        foreach ($sortedStatuses as $index => $status_id) {
            $status = Status::find($status_id);
            $status->status_order_no = $index + 1; // Assuming the order starts from 1
            $status->save();
        }

        // Return a response indicating the success
        return response()->json(['message' => 'Statuses sorted successfully']);
    }

	/**
	 * Retrieve statuses by list ID.
	 *
	 * @param  int  $list_id
	 * @return \Illuminate\Http\JsonResponse
	 */
	 public function showStatusesByList($list_id)
	{
		$statuses = Status::where('status_list_id', $list_id)->orderBy('status_order_no', 'asc')->get();

		return response()->json($statuses);
	}

	/**
	 * Retrieve statuses by status ID.
	 *
	 * @param  int  $list_id
	 * @return \Illuminate\Http\JsonResponse
	 */
	 public function showStatus($status_id)
	{
		$status = Status::findOrFail($status_id);

		return response()->json($status);
	}

	public function updateStatus(Request $request)
	{
		try {
			$id = $request->input('statusId');
			$name = $request->input('statusName');
			$color = $request->input('statusColor');
	
			$status = Status::findOrFail($id)->update(['status_name' => $name, 'status_color' => $color]);
			return response()->json([
				'status' => 'success',
				'message' =>'successfully updated the status.'
			]);
		} catch (\Throwable $th) {
			return response()->json([
				'status' => 'failed',
				'message' =>'Status update failed '.$th
			], 500);
		}

	}
	public function addStatus(Request $request)
	{
		try {
			$list_id = $request->input('list_id');
			$name = $request->input('statusName');
			$color = $request->input('statusColor');
			$dateToday = Carbon::today()->toDateString();
	
			$status = Status::insert([
				'status_list_id' => $list_id,
				'status_name'     => $name,
				'status_color'    => $color,
				'status__date_created'      => $dateToday
			]);
			return response()->json([
				'status' => 'success',
				'message' =>'successfully added the status.'
			]);
		} catch (\Throwable $th) {
			return response()->json([
				'status' => 'failed',
				'message' =>'Status added failed '.$th
			], 500);
		}

	}

	public function deleteStatus($status_id)
	{
		try {
			$status = Status::findOrFail($status_id);
			$status->delete();
			return response()->json([
				'status' => 'success',
				'message' =>'successfully deleted the status.'
			]);
		} catch (\Throwable $th) {
			return response()->json([
				'status' => 'failed',
				'message' =>'Status delete failed '.$th
			], 500);
		}

	}

	public function showTagsByList($list_id)
	{
		$tags = TaskTag::where('tag_list_id', $list_id)->get();

		return response()->json($tags);
	}

	public function showFinanceByService($service_id)
	{
		$finance_phases = FinancePhase::with('fields')->where('phase_space_id', $service_id)->get();

		return response()->json($finance_phases);
	}


	public function getFinancePhaseById($phase_id)
	{
		$currencies = DB::table('finance_currency')->get();
		$financephase = FinancePhase::with(['fields' => function($query){
			$query->orderBy('finance_order','asc');
		}])->find($phase_id);
		$financephase->currencies = $currencies;
		return response()->json($financephase);
	}

	public function updateFinanceOptionName(Request $request)
	{		
        $id = $request->input('id');
        $name = $request->input('name');

		FinanceField::where('finance_id',$id)->update(['finance_name' => $name]);

		return response()->json(['message' => 'Successfully updated Finance Option name']);
	}

	public function updateFinanceOption(Request $request)
	{		
		try {
			$request->validate([
				'id' => 'required',
				'name' => 'required',
				'amount' => 'required',
				'currency' => 'required',
				'privacy' => 'required',
			]);
			$id = $request->input('id');
			$name = $request->input('name');
			$amount = $request->input('amount');
			$currency = $request->input('currency');
			$privacy = $request->input('privacy');
	
			FinanceField::where('finance_id',$id)->update(['finance_name' => $name, 'finance_value' => $amount, 'finance_currency' => $currency, 'finance_privacy' => $privacy]);
	
			return response()->json(['success' => true,'message' => 'Successfully updated Finance Option']);
		} catch (\Throwable $th) {
			return response()->json(['message' => 'Something went wrong', 'error' => $th->getMessage()], 500);
		}
	}

	public function createFinancePhase(Request $request)
	{
		try {
			$service_id = $request->input('serviceId');
			$name = $request->input('financePhase');
	
			FinancePhase::insert([
				'phase_space_id' => $service_id,
				'phase_name'     =>  $name
			]);

			return response()->json(['message' => 'Successfully Added Finance Phase!']);
		} catch (\Throwable $th) {
            return response()->json([
                'message' => 'Failed to delete finance option.',
                'error' => $th->getMessage(),
            ], 500);
		}
	}

	public function deleteFinancePhase($id)
	{
		try {
			$finance_phase = FinancePhase::with('fields')->findOrFail($id);
			$countFields = count($finance_phase->fields);
			if ($countFields <= 0) {
				$finance_phase->delete();
				
				return response()->json([
					'message' => 'Finance option deleted successfully.',
				]);
			}
			
			return response()->json([
				'message' => 'Fields under this finance phase must be deleted first manually.',
				'error' => "Finance phase cannot be deleted"
			]);

		} catch (\Throwable $th) {
            return response()->json([
                'message' => 'Finance option deleted successfully.',
				'error'   => $th->getMessage()
            ], 500);
		}
	}

	public function updateFinanceName(Request $request)
	{		
        $id = $request->input('finance_id');
        $name = $request->input('finance_name');

		FinancePhase::find($id)->update(['phase_name' => $name]);

		return response()->json(['message' => 'Successfully updated Finance Phase name']);
	}

	public function deleteFinanceOption($id)
	{
		try {
            $option = FinanceField::findOrFail($id);
            $option->delete();

            return response()->json([
                'message' => 'Finance option deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete finance option.',
                'error' => $e->getMessage(),
            ], 500);
        }
	}

	public function createFinanceOption(Request $request)
	{
		try {
			$request->validate([
				"phase_id" =>'required',
				'name' => 'required',
				'amount' => 'required',
				'currency' => 'required',
				'service_id' => 'required',
				'privacy' => 'required',
			]);

			FinanceField::insert([ 
				'finance_space_id' => $request->service_id,
				'finance_phase_id' => $request->phase_id,
				'finance_name' => $request->name,
				'finance_order' => 100,
				'finance_currency' => $request->currency,
				'finance_value' => $request->amount,
				'finance_type' => 'text',
				'finance_privacy' => $request->privacy,
			]);

			return response()->json([
                'message' => 'Finance option added successfully.',
            ]);
		} catch (\Throwable $th) {
            return response()->json([
                'message' => 'Failed to add finance option.',
                'error' => $e->getMessage(),
            ], 500);
		}
	}

	public function sortFinanceFields(Request $request){
		try {
			$field_ids = $request->input('sortedIds');

			foreach ($field_ids as $index => $field_id) {
				FinanceField::where("finance_id", "=", $field_id)->update(["finance_order" => $index+1]);
			}

			return response()->json(['message' => 'Successfully sorted finance options']);
		} catch (\Throwable $th) {
			return response()->json([
                'message' => 'Failed to sort finance option.',
                'error' => $th->getMessage(),
            ], 500);
		}
	}

	public function getRequirementsBySpace($service_id)
	{
		$requirements = RequirementField::where('requirement_space_id',$service_id)->orderBy('requirement_order_no', 'asc')->get();

		return response()->json($requirements);
	}

	public function getRequirementById($req_id)
	{
		$requirement = RequirementField::with('options')->find($req_id);

		return response()->json($requirement);
	}


	public function migrateAssignedStatusFields(){
		try {
			$fields = Field::all();
			foreach ($fields as $index => $field) {
				if(!empty($field['field_assign_to'])){
					$assigned_statuses_raw = $field['field_assign_to'];
					$array = explode(',',$assigned_statuses_raw);
					for ($i=1; $i < count($array) ; $i+=2){
						$status_id = $array[$i];
						$status = Status::find($status_id);
						if($status){
							$status->field_id = $field->field_id;
							$status->save();
						}
					}
				}
			}
		} catch (\Throwable $th) {
			dd($th);
		}
	}

	// public function fetchFieldsWithStatuses($list_id){
	// 	try {
	// 		$space_id = $request->input('space_id');
	// 		$list_id = $request->input('list_id');

	// 		$statuses = Status::where('status_list_id', $list_id)
	// 			->orderBy('status_order_no', 'ASC')
	// 			->get();

	// 		$fields_arr = [];

	// 		foreach ($statuses as $status) {
	// 			$statusId = $status->status_id;
	// 			$fields = Field::where('field_space_id', $space_id)
	// 				->get();

	// 			foreach ($fields as $field) {
	// 				$field_assign_to = $field->field_assign_to;

	// 				if ($field_assign_to != "") {
	// 					$assign_array = explode(",", $field_assign_to);
	// 					$key = array_search($list_id, $assign_array);

	// 					if ($key !== false && isset($assign_array[$key + 1])) {
	// 						$statusIdFromAssign = $assign_array[$key + 1];

	// 						if ($statusId == $statusIdFromAssign) {
	// 							$fields_arr[] = $field;
	// 						}
	// 					}
	// 				}
	// 			}
	// 		}

	// 		return response()->json($fields_arr);
	// 	} catch (\Throwable $th) {
	// 		//throw $th;
	// 	}
	// }
	public function fetchFieldsWithStatuses($list_id)
	{
		try {
			$statuses = Status::with('list')->where('status_list_id', $list_id)->orderBy('status_order_no','asc')->get();

			foreach ($statuses as $key => $status) 
			{
				$service_id = $status->list['list_space_id'];
				$fields = Field::where('field_space_id','=',$service_id)->get();
				$fields_arr = [];
				foreach($fields as $i => $field)
				{
					$arr = explode(",", $field->field_assign_to);
					$key = array_search($list_id, $arr);
					if ($key !== false && isset($arr[$key + 1])) {
						$statusIdFromAssign = $arr[$key + 1];

						if ($status->status_id == $statusIdFromAssign) {
							$fields_arr[] = $field;
						}
					}
					// for ($i=1; $i < count($arr); $i+=2) { 
					// 	$status_id = $arr[$i];
					// 	if($status->status_id == $status_id)
					// 	{
					// 		$fields_arr[] = $field;
					// 	}
					// }
				}
				$status->fields = $fields_arr;
			}

			return response()->json($statuses);
		} catch (\Throwable $th) {
			return response()->json($th->getMessage(), 500);
		}
	}

	public function unassignFieldToStatus(Request $request,$field_id)
	{
		try {

			$list_id = $request->input('listId');
			$field = Field::findOrFail($field_id);
			$assigned = $field->field_assign_to;
			$arr = explode(",",$assigned);
			if(count($arr) < 2){
				$field->field_assign_to = '';
			}else{
				$key = array_search($list_id, $arr);
				unset($arr[$key], $arr[$key++]);

				// Recreate the comma-separated string
				$new_assign = implode(",", $arr);
				$field->field_assign_to = $new_assign;
			}
			$field->save();

			return response()->json(['message' => 'Success']);
		} catch (\Throwable $th) {
			return response()->json($th->getMessage(), 500);
		}
	}

	public function fetchUnassignedFields($list_id)
	{
		try {
			$list = ListModel::findOrFail($list_id);
			$service_id = $list->list_space_id;
			$fields = Field::where('field_space_id', $service_id)->orderBy('field_order', 'asc')->get();
			$unassigned_fields = [];
			foreach ($fields as $key => $field):
				$arr = explode(",",$field->field_assign_to);
				if(!in_array($list_id, $arr)):
					$unassigned_fields[] = $field;
				endif;
			endforeach;
	
			return response()->json(['success' => true, 'data' => $unassigned_fields]);
		} catch (\Throwable $th) {
			return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
		}
	}

	public function assignFieldToStatus(Request $request)
	{
		try {
			$request->validate([
				'fieldId' => 'required',
				'listId' => 'required',
				'statusId' => 'required',
			]);
			$assignFieldId = $request->input('fieldId');
			$fieldAssignTo = $request->input('listId') . ',' . $request->input('statusId');

			$field = Field::find($assignFieldId);

			if($field)
			{
				$prevFieldAssignTo = $field->field_assign_to;

				if($prevFieldAssignTo == null)
				{
					$field->field_assign_to = $fieldAssignTo;
				}
				else
				{
					$newAssign = $prevFieldAssignTo . ',' . $fieldAssignTo;
					$field->field_assign_to = $newAssign;
				}

				$field->save();
			}
			return response()->json(['success' => true, 'message' => "Successfully assigned field"]);
		} catch (\Throwable $th) {
			return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
		}
	}

	public function getAllStatuses(){
		
	}

	// function for assigning all statuses to a step base on ServicesStatusStepsAssigned model
	public function assignStatusToStep(){
		try {
			$assignees = ServicesStatusStepsAssigned::all();
			foreach($assignees as $i => $val){
				$step_id = $val->step_id;
				$status_id = $val->status_id;
				$status = Status::find($status_id);
				if ($status) {
					$status->step_id = $step_id;
				}
	
			}

			return response(['success'=> true]);
		} catch (\Throwable $th) {
			return response(['success'=> false, 'error' => $th->getMessage()],500);
		}

	}

	public function stepsWithStatuses()
	{
		$steps = ServicesStep::with('statuses')->get();

		return response()->json($steps);
	}

	public function stepsWithStatusesBy()
	{
		$steps = ServicesStep::with('statuses')->get();

		return response()->json($steps);
	}

}