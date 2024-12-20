<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;
use Illuminate\Support\Facades\DB;

class ContactController extends Controller
{
    public function index()
    {
        $contacts = Contact::where('contact_assign_to', '!=', '')
        ->select('contact_id','contact_fname','contact_mname','contact_lname','contact_email','contact_cpnum','contact_profile')
        ->get();

        return response($contacts);
    }
    public function add(Request $request)
    {
        $contact = new Contact;
        $contact->contact_fname = $request->contact_fname;
        $contact->contact_mname = $request->contact_mname;
        $contact->contact_lname = $request->contact_lname;
        $contact->contact_email = $request->contact_email;
        $contact->contact_cpnum = $request->contact_cpnum;
        $contact->contact_profile = $request->contact_profile;

    }
        
}