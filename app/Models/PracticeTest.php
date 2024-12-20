<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PracticeTest extends Model
{
    use HasFactory;

    protected $table = 'pt_bank';

    protected $primaryKey = 'pt_bank_id';

    const CREATED_AT = 'date_created';

    public $timestamps = false;
}
