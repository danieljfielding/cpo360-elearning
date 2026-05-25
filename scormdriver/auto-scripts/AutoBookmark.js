// version: 7.12.0.a.1.6.0
// sha: c5acdf9e23fb68416e40b30e8dfedd4f7c071f38
function SetBookmark(){var o=window.parent,t=window.location.href;o.SetBookmark(t.substring(t.toLowerCase().lastIndexOf("/scormcontent/")+14,t.length),document.title),o.CommitData()}SetBookmark();