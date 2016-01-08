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
        '<div class="task-item editable">'+
            '<div class="task-title"></div>'+
            '<div class="task-date"></div>'+

            '<div class="tasks"></div>'+

            '<div class="tasks-hidden">' +
                '<div class="tasks"></div>' +
                '<div class="tasks-done"></div>'+
            '</div>'+

            '<div class="author-and-icons">'+
                '<div class="task-author"></div>'+
                '<div class="task-block">' +
                    '<i class="icon users fa fa-users"></i> '+
                    '<i class="icon delete fa fa-trash"></i> '+
                    '<i class="icon fa un-archive fa-caret-square-o-up"></i> '+
                    '<i class="icon fa archive fa-caret-square-o-down"></i> '+
                '</div>'+
            '</div>'+
        '</div>',

    user:
        '<div class="user">' +
            '<span class="user-name"></span> ' +
            '<div><i class="icon edit fa fa-pencil"></i>' +
            '<i class="icon remove-user fa fa-times"></i></div> ' +
        '</div>',

    user_found:
        '<div class="user"></div>'
};

max_tasks = 3;
max_visible_task_length = 28;
server_data = {};

$(document).ready(function(){

    //===============Рашаривание заданий==============
    $(".users-popup").hide();

    $('.users-search').keyup(function() {
        clearTimeout($.data(this, 'timer'));
        $(".found-users .user").remove();
        $(".no-users-found").hide();
        $(".loading").show();
        var wait = setTimeout(search, 500);
        $(this).data('timer', wait);
    });

    function search(){
        var username = $('.users-search').val();
        $(".no-users-found").text("Пользователи не найдены");
        if (username.length > 1) {
            $(".loading").hide();
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "/list/users/find/",
                data: {
                    "csrfmiddlewaretoken": $("#csrf-token").val(),
                    "user": username
                },
                success: function (users) {
                    if (users.length == 0)
                        $(".no-users-found").show();
                    else{
                        for(var i = 0; i<users.length; i++){
                            if ($(".added-users .user span:contains('" + users[i]["user"] + "')")) {
                                var $user = $($.parseHTML(html.user_found));
                                $user.text(users[i]["user"]);
                                $(".found-users").append($user);
                            }
                        }
                    }
                }
            })
        }
        else{
            $(".no-users-found").text("Введите минимум 2 символа");
            $(".no-users-found").show();
            $(".loading").hide();
        }
    }

    $(".task-container").on("click", ".icon.users", function(event){
        event.stopPropagation();
        $(".users-popup .added-users").off("click", ".edit");
        $(".found-users").off("click", ".user");
        var $task = $(this).parents(".task-item");
        var offset = $(this).offset();
        var $popup = $(".users-popup");
        var height = $(window).height();
        if (offset.top + 200 > height)
            offset.top -= 200;
        $popup.offset(offset).show();
        $popup.find(".added-users").html("");
        var id = $task.attr('data-list-id');

        $(".found-users").on("click", ".user", function () {
            var user = $(this).text();
            var $user = $(this);
            $.ajax({
                type: "POST",
                url: "/list/users/change_list_users/",
                data: {
                    "csrfmiddlewaretoken": $("#csrf-token").val(),
                    "id": id,
                    "user": user
                },
                success: function () {
                    $user.remove();
                    var $user_new = $($.parseHTML(html.user));
                    $user_new.find(".user-name").text(user);
                    $popup.find(".added-users").append($user_new);
                }
            })
        });

        $(".users-popup .added-users").on("click", ".remove-user", function(){
            var name = $(this).parents(".user").find(".user-name").text();
            var $user = $(this).parents(".user");
            $.ajax({
                type: "POST",
                url: "/list/users/change_list_users/",
                data:{
                    "csrfmiddlewaretoken": $("#csrf-token").val(),
                    "id": id,
                    "user": name
                },
                success: function () {
                    $user.remove();
                }
            })
        });

        $(".users-popup .added-users").on("click", ".edit", function(){
            var name = $(this).parents(".user").find(".user-name").text();
            var pen = $(this);
            $.ajax({
                type: "POST",
                url: "/list/users/change_edit_rights/",
                data:{
                    "csrfmiddlewaretoken": $("#csrf-token").val(),
                    "id": id,
                    "user": name
                },
                success: function () {
                    pen.toggleClass("permitted");
                }
            })
        });

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/list/users/all/",
            data: {
                "csrfmiddlewaretoken": $("#csrf-token").val(),
                "id": id
            },
            success: function (users) {
                for(var i = 0; i<users.length; i++){
                    var $user = $($.parseHTML(html.user));
                    $user.find(".user-name").text(users[i]["user"]);
                    if(users[i]["edit"])
                        $user.find(".icon.edit").addClass("permitted");
                    $popup.find(".added-users").append($user);
                }
            }
        })
    });



    $(".users-popup .user-add").click(function(){
        $(".users-popup .users-add-search").animate({width:'toggle'},350);
    });

    $(".users-popup").click(function(event){
        event.stopPropagation();
    });
    //================================================


    function init_server_data(){
        $(".task-item").each(function(){
            var id = $(this).attr("data-list-id");
            server_data[id] = $(this).html();
        })
    }
    //============Архивация заданий============
    function archive_list($task, $container){
        if($task.length > 0) {
            var id = $task.attr('data-list-id');
            $.ajax({
                type: "POST",
                url: "/list/archive/",
                data: {
                    "csrfmiddlewaretoken": $("#csrf-token").val(),
                    "id": id
                },
                success: function () {
                    $.when($task.slideUp(500)).then(function(){
                        $container.prepend($task);
                        $task.show();
                    });
                }
            });
        }
    }

    $(".task-container").on("click", ".icon.archive", function(event){
        event.stopPropagation();
        var $task = $(this).parents(".task-item");
        archive_list($task, $(".task-container.archived"));
    });

    $(".task-container").on("click", ".icon.un-archive", function(event){
        event.stopPropagation();
        var $task = $(this).parents(".task-item");
        archive_list($task, $(".task-container:not(.archived)"));
    });

    $(".menu-list .done").click(function(){
        $(".task-container:not(.archived)").hide();
        $(".task-container.archived").show();
        $(".list-window").addClass("archived");
    });

    $(".menu-list .list").click(function(){
        $(".task-container:not(.archived)").show();
        $(".task-container.archived").hide();
        $(".list-window").removeClass("archived");
    });

    //=========================================

    //==============Публикация списков=========
    function toggle_list_public($task){
        if($task.length > 0) {
            var id = $task.attr('data-list-id');
            $.ajax({
                type: "POST",
                url: "/list/make_public/",
                data: {
                    "csrfmiddlewaretoken": $("#csrf-token").val(),
                    "id": id
                },
                success: function () {
                    $task.find(".icon.share").toggleClass("shared");
                }
            });
        }
    }

    $(".task-container").on("click", ".icon.share", function(event){
        event.stopPropagation();
        var $task = $(this).parents(".task-item");
        toggle_list_public($task);
    });
    //=========================================

    //Обновление данных в текущем активном списке заданий на сервере
    function update_active_on_server(){
        var $task = $(".task-item.active");
        if($task.length != 0) {
            var id = $task.attr("data-list-id");
            if(server_data[id] != $task.html()) {
                var title = $task.find(".task-title").text();
                var tasks = $task.find(".tasks-hidden .tasks .task");
                var tasks_done = $task.find(".tasks-hidden .tasks-done .task");

                var tsks = [];
                tasks.each(function () {
                    tsks.push({"text": $(this).find(".task-descr").text(), "is_done": false})
                });

                var tsks_done = [];
                tasks_done.each(function () {
                    tsks_done.push({"text": $(this).find(".task-descr").text(), "is_done": true})
                });

                $.ajax({
                    type: "POST",
                    url: "/list/update/",
                    data: {
                        "csrfmiddlewaretoken": $("#csrf-token").val(),
                        "data": JSON.stringify({
                            "id": id,
                            "is_public": false,
                            "title": title,
                            "tasks": tsks.concat(tsks_done)
                        })
                    },
                    success: function(){
                        server_data[id] = $task.html();
                    }
                });
            }
        }
    }

    setInterval(update_active_on_server, 2000);

    //====================Окно входа======================
    //Появление окна входа
    $(".sign-in-show").click(function(){
        $('.sign-in-popup').addClass("show");
    });

    //Скрытие окна входа
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
        if($(".sign-in-popup form").attr("action") == "/registration/") {
            var inputs = $(".sign-in-popup input[type='password']");
            if (inputs.hasClass('valid')) {
                return
            }

            event.preventDefault();
        }
    });

    $(".registration-link").click(function(){
        $(".sign-in-popup .registration").toggle(0,function() {
            if ($(this).is(':visible'))
                $(this).css('display','table-row');
        });
        var $form = $(".sign-in-popup form");
        var url = $form.attr("action");
        $form.attr("action", url == "/login/" ? "/registration/": "/login/");
        $form.find("input[type='email']").prop('disabled', function(i, v) { return !v; });
        $(this).text($(this).text() == "Регистрация" ? "Вход": "Регистрация");
        $(this).next().text($(this).next().text() == "Зарегистрироваться" ? "Войти": "Зарегистрироваться");
    });
    //====================================================

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

    //Показать таски в списке всех листов
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

    //Активный таск переносится в редактор
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
            update_active_on_server();
            delete_active_if_empty();
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
            $(".edit-head .task-date").text($(".task-item.active .task-date").text());
            $("#list-title").prop('readonly', false);
            $(".add-task").show();
            if (!$(this).hasClass("editable")){
                $(".edit-window .delete-icon").hide();
                $(".add-task").hide();
                $(".edit-window .task-descr").attr("contenteditable", "false");
                $("#list-title").prop('readonly', true);
            }
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

    function delete_task($task){
        if($task.length > 0) {
            var id = $task.attr('data-list-id');
            $.ajax({
                type: "POST",
                url: "/list/delete/",
                data: {
                    "csrfmiddlewaretoken": $("#csrf-token").val(),
                    "id": id
                },
                success: function () {
                    $task.remove();
                    delete server_data[id];
                }
            });
        }
    }

    function delete_active_if_empty(){
        if ($(".task-item.active .tasks-hidden .tasks").children().length == 0 &&
            $(".task-item.active .tasks-hidden .tasks-done").children().length == 0){
            delete_task($(".task-item.active"));
        }
    }

    //Очистка полей ввода при нажатии на кнопку Create и создание нового списка
    $(".create").on("click", function(){
        $("#list-title").val("");
        $(".edit-container .tasks-done").html("");
        $(".edit-container .tasks").html("");

        delete_active_if_empty();

        $(".task-container:not(.archived)").show();
        $(".task-container.archived").hide();

        $(".task-container:not(.archived)").prepend(html.new_task);
        $(".task-item.active").removeClass("active");
        $(".task-container:not(.archived) .task-item:first-child").addClass("active");

        $(".task-item:first-child .task-title").text("Название списка");

        $(".task-item:first-child .author-and-icons .task-author").text($(".user-block .username").text());

        var d = new Date();
        var day = ('0' + d.getDate()).slice(-2);
        var month = ('0' + d.getMonth() + 1).slice(-2);
        var year = d.getFullYear();
        $(".task-item:first-child .task-date").text(day + "." + month + "." + year);
        $(".edit-head .task-date").text(day + "." + month + "." + year);

        var $new_task = $(".task-item.active");

        $.ajax({
            type: "POST",
            url: "/list/new/",
            data: {
                "csrfmiddlewaretoken": $("#csrf-token").val()
            },
            success: function(id){
                $new_task.attr("data-list-id", id);
                server_data[id] = $new_task.html();
            }
        });
    });

    //==============Добавление новых пунктов в таски============
    function new_task(){
        event.stopPropagation();
        var $task_descr = $('.edit-window .tasks .task:last-of-type .task-descr');
        if ($task_descr.text() != "" || $task_descr.length == 0) {
            $('.edit-window .tasks').append(html.task);
        }
        $task_descr = $($task_descr.selector);
        $task_descr.focus();
    }

    //При клике на добавление задания
    $('.edit-container .add-task').click(new_task);

    //При нажатии на Enter
    $('.edit-window .tasks').on('keypress', '.task-descr', function(event){
        var $last_task_descr = $('.edit-window .tasks .task:last-of-type .task-descr');
        if (event.which == 13) {
            if ($last_task_descr[0] == $(this)[0]) {
                event.preventDefault();
                new_task(event);
            } else {
                event.preventDefault();
                $(this).parent().next().find('.task-descr').focus();
            }
        }
    });

    //Удаление пунктов при нажатии вне таска
    $('body').click(function () {
        var $task_descr = $('.edit-window .tasks .task:last-of-type .task-descr');
        if ($task_descr.text() == ""){
            $task_descr.parent().remove();
        }
        $(".users-popup").offset({top:0, left:0}).hide();
        $(".users-popup .users-add-search").hide();
        $(".no-users-found").hide();
        $(".loading").hide();
        $(".users-search").val("");
    });
    //==========================================================


    //Удаление активного таска
    $(".task-container").on("click", ".icon.delete", function(event){
        event.stopPropagation();
        delete_task($(this).parents(".task-item"));
    });

    //Удаление задания из списка
    $(".edit-container").on("click", ".delete-icon", function(){
        $(this).parent().remove();

        refresh_active();

        show_visible_tasks()
    });

    //Выполненные таски
    $(".edit-container .tasks").on("click", ".icon", function(){
        if($(".task-item.active").hasClass("editable")) {
            $(this).removeClass('fa-square-o');
            $(this).addClass('fa-check-square-o');

            task_done = $(this).parent();
            $('.edit-container .tasks-done').append(task_done);

            refresh_active();

            show_visible_tasks();
        }
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

    init_server_data();
});