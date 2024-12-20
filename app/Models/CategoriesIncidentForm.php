<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriesIncidentForm extends Model
{
    use HasFactory;

    protected $table = 'categories_incident_form';

    protected $primaryKey = 'incident_id';

    public $timestamps = false;
}
