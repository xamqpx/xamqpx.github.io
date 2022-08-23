jQuery($ => {
    $(".more-less").click(function() {
      let $more = $(this).siblings('ul.more').toggleClass("main");
      
      if ($more.hasClass('main')) {
        $(this).text('Read Less');
      } else {
        $(this).text('Read More');
      }
    });
  });