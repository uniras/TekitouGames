<?php
function mb_substr_replace($output, $replace, $posOpen, $posClose)
{
    $result = mb_substr($output, 0, $posOpen);
    $result .= $replace;
    $result .= mb_substr($output, $posOpen + $posClose);
    return $result;
}

function setlink($board, $end, $pos)
{
    $chr = mb_substr($board, $pos, 1);
    if ($chr == '　' && $end == false) {
        echo '<a href="tictactoe.php?board='.$board.'&pos='.$pos.'">'.$chr.'</a>';
    } else {
        if ($chr == '〇') {
            echo '<span style="color: red">'.$chr.'</span>';
        } elseif ($chr == '×') {
            echo '<span style="color: blue">'.$chr.'</span>';
        } else {
            echo $chr;
        }
    }
}

function check($board)
{
    $achk = array();
    for ($i = 0; $i < 9; $i++) {
        $achk[$i] = mb_substr($board, $i, 1);
    }

    if ($achk[0] != '　' && $achk[0] == $achk[1] && $achk[1] == $achk[2]) {
        return $achk[0];
    }
    if ($achk[3] != '　' && $achk[3] == $achk[4] && $achk[4] == $achk[5]) {
        return $achk[3];
    }
    if ($achk[6] != '　' && $achk[6] == $achk[7] && $achk[7] == $achk[8]) {
        return $achk[6];
    }
    if ($achk[0] != '　' && $achk[0] == $achk[3] && $achk[3] == $achk[6]) {
        return $achk[0];
    }
    if ($achk[1] != '　' && $achk[1] == $achk[4] && $achk[4] == $achk[7]) {
        return $achk[1];
    }
    if ($achk[2] != '　' && $achk[2] == $achk[5] && $achk[5] == $achk[8]) {
        return $achk[2];
    }
    if ($achk[0] != '　' && $achk[0] == $achk[4] && $achk[4] == $achk[8]) {
        return $achk[0];
    }
    if ($achk[2] != '　' && $achk[2] == $achk[4] && $achk[4] == $achk[6]) {
        return $achk[2];
    }

    return '　';
}

function boardcount($board)
{
    $cnt = 0;
    for ($i = 0; $i < 9; $i++) {
        $chr = mb_substr($board, $i, 1);
        if ($chr == '〇' || $chr == '×') {
            $cnt += 1;
        }
    }
    return $cnt;
}

if (isset($_GET['board'])) {
    $board = $_GET['board'];
    if (mb_strlen($board) != 9) {
        $board = '　　　　　　　　　';
    }
}

$turn = boardcount($board);
if ($turn % 2 == 0) {
    $str = '×';
} else {
    $str = '〇';
}

if (isset($_GET['pos'])) {
    $cpos = intval($_GET['pos']);
    if ($cpos >= 0 && $cpos <= 8) {
        $chr = mb_substr($board, $cpos, 1);
    }
    if ($cpos >= 0 && $cpos <= 8 && $chr != '〇' && $chr != '×') {
        $board = mb_substr_replace($board, $str, $cpos, 1);
    }
    $end = false;
    $win = check($board);
    $turn = boardcount($board);
    if ($win != '　') {
        $msg = $win.'の勝ちです';
        $end = true;
    } elseif ($turn >= 9) {
        $msg = '引き分けです';
        $end = true;
    } else {
        if ($turn % 2 == 0) {
            $msg = '×のターンです';
        } else {
            $msg = '〇のターンです';
        }
    }
} else {
    $board = '　　　　　　　　　';
    $msg = '×のターンです';
}
?>

<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <title>Tic Tac Toe</title>
    <style>
        table {
            border-collapse: collapse;
        }

        td {
            width: 150px;
            height: 150px;
            font-size: 112px;
            text-align: center;
            line-height: 0;
        }

        a {
            text-decoration: none;
        }

        .cell1 {
            border-right:solid 15px;
            border-bottom:solid 15px;
        }

        .cell2 {
            border-bottom:solid 15px;
        }

        .cell3 {
            border-right:solid 15px;
        }
    </style>
</head>

<body>
    <div id="output"><?= $msg ?></div>
    <table>
        <tbody>
            <tr>
                <td id="c0" class="cell1"><?php setlink($board, $end, 0); ?></td>
                <td id="c1" class="cell1"><?php setlink($board, $end, 1); ?></td>
                <td id="c2" class="cell2"><?php setlink($board, $end, 2); ?></td>
            </tr>
            <tr>
                <td id="c3" class="cell1"><?php setlink($board, $end, 3); ?></td>
                <td id="c4" class="cell1"><?php setlink($board, $end, 4); ?></td>
                <td id="c5" class="cell2"><?php setlink($board, $end, 5); ?></td>
            </tr>
            <tr>
                <td id="c6" class="cell3"><?php setlink($board, $end, 6); ?></td>
                <td id="c7" class="cell3"><?php setlink($board, $end, 7); ?></td>
                <td id="c8"><?php setlink($board, $end, 8); ?></td>
            </tr>
        </tbody>
    </table>
</body>

</html>