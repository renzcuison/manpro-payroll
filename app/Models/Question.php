<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $table = 'pt_questions';

    protected $primaryKey = 'pt_ques_id';

    const CREATED_AT = 'date_updated';

    public $timestamps = false;
}
