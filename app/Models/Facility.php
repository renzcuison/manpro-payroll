<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;
    
    protected $table = 'tbl_corporates_facilities';

    public $timestamps = false;
    
    const CREATED_AT = 'date_created';

    protected $guarded = [];

    public function clients()
    {
        return $this->hasMany(Task::class, "facility_id")->with('list','client', 'status');
    }
}