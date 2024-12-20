<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskTag extends Model
{
    use HasFactory;

    protected $table = 'tags';

    protected $primaryKey = 'tag_id';

    protected $guarded = [];

    public $timestamps = false;
}