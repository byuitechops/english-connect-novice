/*eslint-env node*/
/*eslint no-console:0*/

var fs = require('fs'),
  structure = require('./structure.js'),
  d3 = require('d3-dsv'),
  htmlFiles = require('./htmlFilesToObject.js')(),
  handlebars = require('Handlebars'),
  lessonPage, practicesPage, page = 0,
  template, location;

if (typeof (process.argv[2]) == 'undefined') {
  location = 'docs'
} else {
  location = 'devPages'
}

function small(string) {
  if (string == null || string == 'undefined') {
    return ""
  } else {
    return string.replace(/ /g, "").toLowerCase().replace('?', "").replace("'", "").replace('!', '')
  }
}

function noWhite(string) {
  return string.replace(/ /g, "");
}

handlebars.registerHelper('generateLinks', function (practice, lesson, topic, practice) {
  var count = practicesPerPage[topic][practice][lesson];
  var out = "";
  var url = "";

  function getUrl(i) {
    quizes.forEach(function (quiz) {
      if (quiz.title == practice + " " + lesson + " - " + topic + " - " + practice + " " + i) {
        url = quiz.mobile_url;
      }
    });
    return url;
  }

  for (var i = 0; i < count; i++) {
    out += '<li id="' + small(lesson) + '_' + small(practice) + '_' + small(topic) + '_psg1" class="reset ' + small(practice) + ' passage"><a href="' + new handlebars.SafeString(getUrl(i + 1)) + '" target="_blank"></a> </li>\n';
  }

  return new handlebars.SafeString(out);
});

handlebars.registerHelper('generateTab1', function () {
  var html = "";
  var lessonNumber = 0;
  structure.lessons.slice(0, 24).forEach(function (lesson) {
    lessonNumber += 1;
    html += '<a href="' + small(lesson) + '.html" class="tile"><p class="lessonTitle">Lesson ' + lessonNumber + '</p><p class="lessonSub">' + lesson + '</p></a>'
  })
  return new handlebars.SafeString(html);
})

handlebars.registerHelper('generateTab2', function () {
  var html = "";
  var lessonNumber = 0;
  console.log(structure.lessons.slice(24))
  structure.lessons.slice(24).forEach(function (lesson) {
    lessonNumber += 1;
    html += '<a href="' + small(lesson) + '.html" class="tile"><p class="lessonTitle">Lesson ' + lessonNumber + '</p><p class="lessonSub">' + lesson + '</p></a>'
  })
  return new handlebars.SafeString(html);
})



function generatePage(lesson, practice) {
  var context = {
    "lesson": lesson,
    "practice": practice,
    "lessonsmall": small(lesson),
    "practicesmall": small(practice)
  }

  if (practice == null) {
    template = handlebars.compile(htmlFiles.lesson);
    return template(context)
  } else if (practice == "Class Practice") {
    template = handlebars.compile(htmlFiles.practice);
    return template(context)
  } else if (practice == "Extra Mile") {
    template = handlebars.compile(htmlFiles.extra_mile);
    return template(context)
  } else if (practice == "Stories") {
    template = handlebars.compile(htmlFiles.stories);
    return template(context)
  }
}

function generateHomePage() {
  var context = {
    "lessons": structure.lessons
  }
  template = handlebars.compile(htmlFiles.index);
  fs.writeFileSync(location + '/index.html', template(context));
}

generateHomePage();
structure.lessons.forEach(function (lesson) {
  //Generate the lesson page
  lessonPage = generatePage(lesson);
  //Write the lesson Page
  fs.writeFileSync(location + '/' + small(lesson) + '.html', lessonPage);
  page++;
  console.log("Wrote page " + page);
  structure.practices.forEach(function (practice) {
    //Generate the practice page
    practicesPage = generatePage(lesson, practice);
    //Write the practice Page
    fs.writeFileSync(location + '/' + small(lesson) + "_" + small(practice) + '.html', practicesPage);
    page++;
    console.log("Wrote page " + page);
  })
})
