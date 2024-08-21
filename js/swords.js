function Sword(color){

    this.swipes = [];

    this.color = color;

    this.prevX = 0;

    this.prevY = 0;

    this.isFirstMove = true;

};




Sword.prototype.draw = function(){

    noFill();

    stroke(this.color);

    strokeWeight(10);

    beginShape();

    for(var i = 0; i < this.swipes.length; i++){

        vertex(this.swipes[i].x, this.swipes[i].y);

    }

    endShape();

};




Sword.prototype.update = function(){

    var maxPoints = 20; // Adjust this value to change the sword trail length




    while (this.swipes.length > maxPoints) {

        this.swipes.splice(0, 1);

    }

};

Sword.prototype.checkSlice = function(fruit){

    if(fruit.sliced || this.swipes.length < 2){

        return false;

    }




    for (var i = 1; i < this.swipes.length; i++) {

        var prevPoint = this.swipes[i - 1];

        var currentPoint = this.swipes[i];




        // Check if the line segment between prevPoint and currentPoint intersects with the fruit

        if (lineCircleIntersection(prevPoint.x, prevPoint.y, currentPoint.x, currentPoint.y, fruit.x, fruit.y, fruit.size / 2)) {

            fruit.sliced = true;

            return true;

        }

    }




    return false;

};




// Helper function to check if a line segment intersects with a circle

function lineCircleIntersection(x1, y1, x2, y2, cx, cy, r) {

    var dx = x2 - x1;

    var dy = y2 - y1;

    var a = dx * dx + dy * dy;

    var b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));

    var c = cx * cx + cy * cy + x1 * x1 + y1 * y1 - 2 * (cx * x1 + cy * y1) - r * r;

    var discriminant = b * b - 4 * a * c;




    if (discriminant < 0) {

        return false;

    }




    discriminant = Math.sqrt(discriminant);

    var t1 = (-b - discriminant) / (2 * a);

    var t2 = (-b + discriminant) / (2 * a);




    return (0 <= t1 && t1 <= 1) || (0 <= t2 && t2 <= 1);

}




Sword.prototype.swipe = function(x, y){

    if (this.isFirstMove) {

        this.prevX = x;

        this.prevY = y;

        this.isFirstMove = false;

        return;

    }




    // Only add new points if the mouse has moved

    if (x !== this.prevX || y !== this.prevY) {

        // Add points between previous and current position for smoother sword movement

        var dx = x - this.prevX;

        var dy = y - this.prevY;

        var steps = Math.max(Math.abs(dx), Math.abs(dy));




        for (var i = 0; i < steps; i++) {

            var t = i / steps;

            var interpX = lerp(this.prevX, x, t);

            var interpY = lerp(this.prevY, y, t);

            this.swipes.push(createVector(interpX, interpY));

        }




        this.prevX = x;

        this.prevY = y;

    }

}