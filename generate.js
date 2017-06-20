/*eslint-env node*/
/*eslint no-console:0*/

var fs = require('fs'),
  structure = require('./structure.js'),
  stories = require('./stories.js'),
  d3 = require('d3-dsv'),
  htmlFiles = require('./htmlFilesToObject.js')(),
  handlebars = require('Handlebars'),
  lessonPage, practicesPage, page = 0,
  template, template2, location;

function zeroed(lessonNumber) {
  if (lessonNumber < 10) {
    return "0" + lessonNumber;
  } else {
    return lessonNumber;
  }
}

if (typeof (process.argv[2]) == 'undefined') {
  location = 'docs'
} else {
  location = 'devPages'
}

var quizzes = d3.csvParse(fs.readFileSync('allTheQuizesFilteredCols.csv', 'utf8'));
handlebars.registerHelper('generateLinks', function (lessonNumber, practiceLink) {
  var html = "",
    filtered;
  if (practiceLink != "ST") {
    /* class practice, and extra mile */
    filtered = quizzes.filter(function (each) {
      return each.title.slice(0, 9) == 'ECN_' + zeroed(lessonNumber) + '_' + practiceLink;
    });
  } else {
    /* Stories */
    filtered = quizzes.filter(function (each) {
      return each.title.slice(0, 9) == 'ECN_' + zeroed(lessonNumber) + '_ST'
    })
  }
  filtered.forEach(function (quiz) {
    html += "<li><a href=" + quiz.html_url + " target='quizFrame'></a></li>";
  });
  return new handlebars.SafeString(html);
});

function small(string) {
  if (string == null || string == 'undefined') {
    return ""
  } else {
    return string.replace(/ /g, "").toLowerCase().replace('?', "").replace("'", "").replace('!', '')
  }
}

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
  structure.lessons.slice(24).forEach(function (lesson) {
    lessonNumber += 1;
    html += '<a href="' + small(lesson) + '.html" class="tile"><p class="lessonTitle">Lesson ' + lessonNumber + '</p><p class="lessonSub">' + lesson + '</p></a>'
  })
  return new handlebars.SafeString(html);
})

function link(practice) {
  if (practice == "Class Practice") {
    return "CP"
  } else if (practice == "Extra Mile") {
    return "EM"
  } else {
    return "ST"
  }
}

function generatePage(lesson, practice) {
  var level = 1;
  var lessonNumber = structure.lessons.indexOf(lesson) + 1;
  if (lessonNumber > 24) {
    level = 2;
  }

  var context = {
    "lesson": lesson,
    "lessonNumber": lessonNumber,
    "level": level,
    "practice": practice,
    "lessonsmall": small(lesson),
    "practicesmall": small(practice),
    "practiceLink": link(practice)
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

function generateHomePages() {
  var context = {
    "lessons": structure.lessons
  }
  /* Page 1 */
  template = handlebars.compile(htmlFiles.home1);
  fs.writeFileSync(location + '/home1.html', template(context));
  /* Page 2 */
  template2 = handlebars.compile(htmlFiles.home2);
  fs.writeFileSync(location + '/home2.html', template2(context));
}

function generateStoryPages(lesson) {
  /*var context = {
    "stories": structure.lessons[lesson].stories
  }
  structure.lessons[lesson].forEach(function (each) {
    template = handlebars.compile(htmlFiles.story)
    fs.writeFileSync(location + '/' + lesson + '_' + each, template(context))
  })*/
  var level = 1;
  var lessonNumber = structure.lessons.indexOf(lesson) + 1;
  if (lessonNumber > 24) {
    level = 2;
  }
  var context = {
    lessonNumber: lessonNumber,
    lesson: lesson,
    lessonsmall: small(lesson),
    level: level,
    story: stories[lessonNumber],
    practiceLink: "ST"
  }
  template = handlebars.compile(htmlFiles.story);
  fs.writeFileSync(location + '/story_' + zeroed(lessonNumber) + '.html', template(context));
}

generateHomePages();
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
    if (practice == "Stories") {
      generateStoryPages(lesson)
      page++;
      console.log("Wrote page " + page);
    }
  })
})
