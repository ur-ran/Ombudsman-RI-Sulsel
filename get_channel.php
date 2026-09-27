<?php
$html = file_get_contents("https://www.youtube.com/@ombudsmanrisulsel");
preg_match('/"channelId":"([^"]+)"/', $html, $matches);
if (isset($matches[1])) {
    echo "CHANNEL_ID: " . $matches[1];
} else {
    // try another regex
    preg_match('/<meta itemprop="channelId" content="([^"]+)"/', $html, $matches);
    if (isset($matches[1])) {
        echo "CHANNEL_ID: " . $matches[1];
    } else {
        preg_match('/"browseId":"([^"]+)"/', $html, $matches);
        echo "CHANNEL_ID (browseId): " . ($matches[1] ?? 'NOT FOUND');
    }
}
