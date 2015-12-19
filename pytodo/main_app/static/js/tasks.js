/**
 * Created by Katherine on 11.12.2015.
 */
html = {
    task:
        '<div class="task">'+
        '   <i class="icon fa fa-square-o"></i>'+
        '   <div contenteditable="true" class="task-descr"></div>' +
        '   <i class="delete-icon fa fa-times-circle"></i>'+
        '</div>',

    new_task:
        '<div class="task-item">'+
            '<div class="task-title"></div>'+
            '<div class="task-date"></div>'+

            '<div class="tasks"></div>'+

            '<div class="tasks-hidden">' +
                '<div class="tasks"></div>' +
                '<div class="tasks-done"></div>'+
            '</div>'+

            '<div class="author-and-icons">'+
                '<div class="task-author"></div>'+
                '<div class="task-block">'+
                    '<a class="icon task-remove" href="#"></a>'+
                '</div>'+
            '</div>'+
        '</div>'
};

max_tasks = 3;
max_visible_task_length = 28;

$(document).ready(function(){

    //Появление окна входа
    $(".sign-in-show").click(function(){
        $('.sign-in-popup').addClass("show");
    });

    $(".sign-in-popup").click(function(){
        $(".sign-in-popup").removeClass("show");
    });

    $(".sign-in-popup form").click(function(event){
        event.stopPropagation();
    });

    //Проверка паролей
    $(".sign-in-popup input[type='password']").on("input", function(){
        var inputs = $(".sign-in-popup input[type='password']");
        var pass1 = $(inputs[0]).val();
        var pass2 = $(inputs[1]).val();
        if (pass1 != "" && pass2 != "") {
            if (pass1 == pass2) {
                inputs.removeClass("invalid");
                inputs.addClass("valid");
            }else{
                inputs.removeClass("valid");
                inputs.addClass("invalid");
            }
        }else{
            inputs.removeClass("valid");
            inputs.removeClass("invalid");
        }
    });

    //Проверка перед отправкой
    $(".sign-in-popup button").click(function(event){
        var inputs = $(".sign-in-popup input[type='password']");
        if (inputs.hasClass('valid')){
            return
        }

        event.preventDefault();
    });

    $('.task-container .task-item').each(function(){
        if($(this).find('.tasks-hidden .tasks .task').length == 0){
            all_tasks = $(this).find('.tasks-hidden .tasks-done .task:nth-child(-n+' + max_tasks + ')').clone();
            all_tasks.find('div').attr('contenteditable', 'false');

            short_tasks(all_tasks);

            tasks = $(this).find('> .tasks');
            tasks.html(all_tasks);

            if($(this).find('.tasks-hidden .tasks-done .task:nth-child(4)').length != 0){
                tasks.append('<i class="big-task fa fa-ellipsis-h"></i>');
            }
        }else{
            all_tasks = $(this).find('.tasks-hidden .tasks .task:nth-child(-n+' + max_tasks + ')').clone();
            all_tasks.find('div').attr('contenteditable', 'false');

            short_tasks(all_tasks);

            tasks = $(this).find('> .tasks');
            tasks.html(all_tasks);

            if($(this).find('.tasks-hidden .tasks .task:nth-child(4)').length != 0){
                tasks.append('<i class="big-task fa fa-ellipsis-h"></i>');
            }
        }
    });


    //принимает на вход массив тасков и укорачивает в них .task-descr
    function short_tasks(tasks){
        all_tasks.find('div').each(function(){
            if($(this).text().length > max_visible_task_length) {
                $(this).text($(this).text().slice(0, max_visible_task_length) + "...");
            }
        });
    }

    function show_visible_tasks(){
        if($('.task-container .task-item.active .tasks-hidden .tasks .task').length == 0){
            //Первые три таска из task-hidden tasks-done
            all_tasks = $('.task-container .task-item.active .tasks-hidden .tasks-done .task:nth-child(-n+' + max_tasks + ')').clone();
            all_tasks.find('div').attr('contenteditable', 'false');

            //Ограничение длины строки таска
            short_tasks(all_tasks);

            tasks = $('.task-container .task-item.active > .tasks');
            tasks.html(all_tasks);

            //Если тасков больше, чем 3, то добавляются точечки после них
            if($('.task-container .task-item.active .tasks-hidden .tasks-done .task:nth-child(4)').length != 0){
                tasks.append('<i class="big-task fa fa-ellipsis-h"></i>');
            }
        } else{
            //Первые три таска из task-hidden tasks
            all_tasks = $('.task-container .task-item.active .tasks-hidden .tasks .task:nth-child(-n+' + max_tasks + ')').clone();
            all_tasks.find('div').attr('contenteditable', 'false');

            //Ограничение длины строки таска
            short_tasks(all_tasks);

            tasks = $('.task-container .task-item.active > .tasks');
            tasks.html(all_tasks);

            //Если тасков больше, чем 3, то добавляются точечки после них
            if($('.task-container .task-item.active .tasks-hidden .tasks .task:nth-child(4)').length != 0){
                tasks.append('<i class="big-task fa fa-ellipsis-h"></i>');
            }
        }
    }

    function refresh_active(){
        var taskDescr = $(".task-item.active .tasks-hidden .tasks");
        taskDescr.html($(".edit-container .tasks").html());

        var taskDone = $(".task-item.active .tasks-hidden .tasks-done");
        taskDone.html($(".edit-container .tasks-done").html());
    }

    //Переключение пунктов меню
    $('.menu-list a').click(function(){
        var number = $(this).index();
        $(this).toggleClass('active');
        $('.menu-list a').not(this).removeClass('active');
    });

    //Переключение активных тасков
    $(".task-container").on("click", ".task-item", function(){
        if(!$(this).hasClass("active")){
            if(($(".task-item.active .tasks").html() == "") && ($(".task-item.active .tasks-hidden .tasks-done").html() == "")){
                $(".task-item.active").remove();
            } else{
                $(".task-item").not($(this)).removeClass("active");
            }
            $(this).addClass("active");

            taskDescr = $(".task-container .task-item.active .tasks-hidden .tasks").html();
            $(".edit-window .tasks").html(taskDescr);
            taskDone = $(".task-container .task-item.active .tasks-hidden .tasks-done").html();
            $(".edit-window .tasks-done").html(taskDone);
            taskTitle = $(this).find(".task-title").text();
            $("#list-title").val(taskTitle);
        }
    });

    //Заголовок задания
    $("#list-title").on("input", function(){
        var taskItemTitle = $(".task-item.active .task-title");
        taskItemTitle.text($(this).val());
    });

    //Текст задания
    $(".edit-container .tasks").on("input", function(){
        var taskDescr = $(".task-item.active .tasks-hidden .tasks");
        taskDescr.html($(this).html());

        show_visible_tasks();
    });

    //Очистка полей ввода при нажатии на кнопку Create
    $(".create").on("click", function(){
        $("#task-title").val("");
        $(".edit-container .tasks-done").html("");
        $(".edit-container .tasks").html("");

        if(($(".task-item.active .tasks").html() == "") && ($(".task-item.active .tasks-hidden .tasks-done").html() == "")){
            $(".task-item.active").remove();
        }

        $(".task-container").prepend(html.new_task);
        $(".task-item.active").removeClass("active");
        $(".task-container .task-item:first-child").addClass("active");

        $(".task-item:first-child .task-title").text("Название списка");

        $(".task-item:first-child .author-and-icons .task-author").text($(".user-block .username").text());
    });

    //Добавление новых пунктов в таски
    $(".edit-container .add-task").on("click", function() {
        last_task = $(".edit-container .tasks .task:last-of-type div");
        if((last_task.length == 0) || (last_task.text() != "")){
            $(".edit-container .tasks").append(html.task);
            $(".edit-container .tasks .task:last-of-type div").focus();
        }
    });

    //Удаление активного таска
    $(".task-container").on("click", ".task-item.active .icon.task-remove", function(){
        $(".task-item.active").remove();
    });

    //Удаление задания из списка
    $(".edit-container").on("click", ".delete-icon", function(){
        $(this).parent().remove();

        refresh_active()

        show_visible_tasks()
    });

    //Выполненные таски
    $(".edit-container .tasks").on("click", ".icon", function(){
        $(this).removeClass('fa-square-o');
        $(this).addClass('fa-check-square-o');

        task_done = $(this).parent();
        $('.edit-container .tasks-done').append(task_done);

        refresh_active()

        show_visible_tasks();
    });

    //Убрать таск из выполненных
    $(".edit-container .tasks-done").on("click", ".icon", function(){
        $(this).removeClass('fa-check-square-o');
        $(this).addClass('fa-square-o');

        task_done = $(this).parent();
        $('.edit-container .tasks').append(task_done);

        refresh_active()

        show_visible_tasks();
    });
})