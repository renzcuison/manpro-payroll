<?php

namespace App\Http\Controllers;

use App\Models\ClientForm;
use App\Models\ClientFormField;
use App\Models\ClientFormFieldInput;
use Illuminate\Http\Request;

class FormsController extends Controller
{
    public function index(Request $request) {
			$formRows = ClientForm::selectRaw('form_id, title')
			->where('is_removed', 0)
			->get()
			->toArray();
			$contact_id = $request->user()->contact_id;

			$forms = [];

			if(count($formRows) > 0) {
				$forms = array_map(function($form) use ($contact_id) {
					$formFields = ClientFormField::selectRaw('tbl_client_form_fields.form_field_id, tbl_client_form_fields.field, tbl_client_form_fields.type, tbl_client_form_fields.is_bold, tbl_client_form_fields.date_created, tbl_client_form_fields.created_by, tbl_client_form_fields.order_no, tbl_client_form_fields_inputs.value')
					->leftJoin('tbl_client_form_fields_inputs', function($join) use ($contact_id) {
						$join->on('tbl_client_form_fields_inputs.form_field_id', '=', 'tbl_client_form_fields.form_field_id');
						$join->on('tbl_client_form_fields_inputs.client_id', '=', ClientFormField::raw($contact_id));
					})
					->where([
						['tbl_client_form_fields.is_deleted', 0],
						['tbl_client_form_fields.form_id', $form['form_id']]
					])
					->orderBy('tbl_client_form_fields.order_no')
					->get();
					$form["formFields"] = $formFields;
					return $form;
				}, $formRows);
			}

			return response($forms);
		}

		public function getFormFieldInputById(Request $request, $formId) {
			$contact_id = $request->user()->contact_id;

			$form = ClientFormFieldInput::where([
				["client_id", $contact_id],
				["form_field_id", $formId]
			])->get();

			return response($form);
		}


		public function editForm(Request $request) {
			$fields = $request->all();
			$contact_id = $request->user()->contact_id;
			$new_fields = array();
			foreach ($fields as $key => $value) {
				if($value === true) {
					$new_fields[] = [$key, 1];
					// ClientFormFieldInput::findOrFail($key)->update(["value" => 1]);
					ClientFormFieldInput::updateOrInsert(
						["form_field_id" => $key, "client_id" => ClientFormFieldInput::raw($contact_id)],
						["value" => 1]
					);
				}else {
					// ClientFormFieldInput::findOrFail($key)->update(["value" => $value]);
					ClientFormFieldInput::updateOrInsert(
						["form_field_id" => $key, "client_id" => ClientFormFieldInput::raw($contact_id)],
						["value" => $value]
					);
					$new_fields[] = [$key, $value];
				}
			}

			return response([
				'server response: ' => $new_fields,
			]);
		}


}
