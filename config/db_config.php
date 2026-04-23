<?php

$conn = mysqli_connect(
    "TEST",
    "if0_41738730",
    "Bk2JoL2loW",
    "if0_41738730_bookfinder"
);

if (!$conn) {
    die("Database Connection Failed: " . mysqli_connect_error());
}

?>