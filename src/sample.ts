export default `


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" data-attr2="42">
    <title>Document</title>
    <script data-a data="yes">
        function ajax(id,snum) {
            var num=snum -2;
            if (num<0) {num=0}
            $('.kactive').removeClass('kactive');
            $('#scroll').scrollTo("#" +num , 500, {axis:'x'});
            $("#" +snum).addClass('kactive');
            $.cookie(window.location.pathname,snum, { expires: 365 });
            jQuery.ajax({        
                crossDomain: true,
                url:     "/frame.php?play=" + id, 
                type:     "GET", 
                dataType: "html", 
                success: function(response){ 
                    $('#player').html(response);
                }
            });
       }
    
    </script>
</head>
<body>
    <!-- asd -->
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>
</body>
</html>`