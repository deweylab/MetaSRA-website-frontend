// This script just writes the navigation bar to the page, a makeshift
// client-side include to keep the navication bar consistent between all
// support pages.

document.write('<nav class="top-nav nav d-flex align-items-center"><a class="nav-link" href="index.html"><img src="assets/logo.png" class="nav-logo"/></a><a class="nav-link" href="about.html">About</a><a class="nav-link" href="download.html">Download</a><a class="nav-link" href="publication.html">Publication</a><a class="nav-link" href="links.html">Links</a><a class="nav-link" href="mailinglist.html">Mailing List</a><a class="nav-link" href="contact.html">Contact</a><a class="btn btn-primary nav-item ml-auto" href="https://docs.google.com/forms/d/e/1FAIpQLSc86s4Bi_g1E0vFLpMBwty8JEE3IMFKwasPrFzBAmngILjJQg/viewform?usp=sf_link" target="_blank">Give Feedback</a></nav>')


// Also google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-64529506-3', 'auto');
ga('send', 'pageview');
