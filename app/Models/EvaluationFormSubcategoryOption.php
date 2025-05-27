<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationFormSubcategoryOption extends Model
{
    use HasFactory;

    protected $table = 'evaluation_form_subcategory_options';

    protected $primaryKey = 'id';

    protected $fillable = [
        'subcategory_id',
        'label',
        'order',
        'deleted_at'
    ];

    public function subcategory()
    {
        return $this->belongsTo(EvaluationFormSubcategory::class, 'subcategory_id');
    }

}
