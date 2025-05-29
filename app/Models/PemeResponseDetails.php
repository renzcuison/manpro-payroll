<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class PemeResponseDetails extends Model implements HasMedia
{
    use InteractsWithMedia, SoftDeletes;

    protected $table = 'peme_response_details';

    protected $fillable = [
        'peme_response_id',
        'peme_q_item_id',
        'peme_q_type_id',
        'value_text',
        'value_remark',
        'value_pass_fail',
        'value_pos_neg',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachment')->singleFile();
    }

    public function response()
    {
        return $this->belongsTo(PemeResponse::class, 'peme_response_id');
    }

    public function question()
    {
        return $this->belongsTo(PemeQItem::class, 'peme_q_item_id');
    }

    public function inputType()
    {
        return $this->belongsTo(PemeQType::class, 'peme_q_type_id');
    }
}
