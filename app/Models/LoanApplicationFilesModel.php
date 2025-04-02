<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoanApplicationFilesModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'loan_applications_files';

    protected $primaryKey = 'id';

    protected $fillable = [
        'loan_application_id',
        'type',
        'path',
    ];

}