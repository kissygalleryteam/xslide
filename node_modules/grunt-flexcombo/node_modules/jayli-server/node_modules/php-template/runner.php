<?php
extract(json_decode($_SERVER['argv'][2], TRUE));
require $_SERVER['argv'][1];

