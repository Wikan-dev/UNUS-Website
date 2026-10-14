<?php
// ============================================================
// helpers.php — responseJSON(): output JSON konsisten + HTTP code
// ============================================================
//
// Dipakai oleh semua controller agar format return seragam
// tanpa menulis http_response_code / json_encode berulang-ulang.

function responseJSON($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}