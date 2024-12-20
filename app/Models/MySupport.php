<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MySupport extends Model
{
    use HasFactory;
    
    protected $table = 'tbl_my_supports';

    protected $guarded = [];
    
    public $timestamps = false;
}
