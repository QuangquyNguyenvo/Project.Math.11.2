// Tạo scene
var scene = new THREE.Scene();

// Tạo camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

// Tạo renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Tạo geometry cho hình vuông
var squareGeometry = new THREE.BoxGeometry(3.5, 0.1, 3);

// Tạo texture cho hình vuông
var textureLoader = new THREE.TextureLoader();
var woodTexture = textureLoader.load('wood.jpg');

// Tạo vật liệu cho hình vuông
var squareMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });

// Tạo mesh cho hình vuông
var square = new THREE.Mesh(squareGeometry, squareMaterial);

// Thêm mesh hình vuông vào scene
scene.add(square);

// Mảng chứa các geometry tương ứng với các hình khác nhau
var pyramidGeometries = [
    new THREE.ConeGeometry(1, 2, 4), // Hình chóp
    new THREE.BoxGeometry(1.5, 1.5, 1.5), // Hình hộp
    new THREE.SphereGeometry(1, 32, 32), // Hình cầu
    // Thêm các geometry khác tương ứng với các hình khác
];

// Biến để lưu chỉ số của geometry hiện tại
var currentGeometryIndex = 0;

// Tạo texture cho hình kim tự tháp
var pyramidTexture = textureLoader.load('pyt.jpg');

// Tạo vật liệu cho hình kim tự tháp
var pyramidMaterial = new THREE.MeshBasicMaterial({ map: pyramidTexture });

// Tạo mesh cho hình kim tự tháp
var pyramid = new THREE.Mesh(pyramidGeometries[currentGeometryIndex], pyramidMaterial);
pyramid.position.set(0, 2, 0);

// Thêm mesh hình kim tự tháp vào scene
scene.add(pyramid);

// Tạo geometry cho raycaster
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var selectedObject = null;
var offset = new THREE.Vector3();
var isRightMouseDown = false;

// Xử lý sự kiện khi di chuyển chuột
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (event.buttons === 1 && selectedObject) {
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObject(pyramid);

        if (intersects.length > 0) {
            selectedObject.position.copy(intersects[0].point.sub(offset));
            checkCollision();
        }
    }

    if (isRightMouseDown) {
        camera.position.x = Math.sin(mouse.x * Math.PI / 2) * 5;
        camera.position.y = Math.sin(mouse.y * Math.PI / 2) * 5;
        camera.position.z = Math.cos(mouse.x * Math.PI / 2) * 5;
        camera.lookAt(0, 0, 0);
    }
}

// Xử lý sự kiện khi nhấn chuột trái
function onMouseDown(event) {
    if (event.button === 0 && selectedObject === null) {
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObject(pyramid);

        if (intersects.length > 0) {
            selectedObject = intersects[0].object;
            var intersectionPoint = intersects[0].point;
            offset.copy(intersectionPoint).sub(selectedObject.position);
        }
    }

    if (event.button === 2) {
        isRightMouseDown = true;
    }
}

// Xử lý sự kiện khi nhả chuột trái
function onMouseUp(event) {
    if (event.button === 0) {
        selectedObject = null;
    }

    if (event.button === 2) {
        isRightMouseDown = false;
    }
}

// Xử lý sự kiện khi nhấp vào nút "Đổi hình khối"
var changeShapeButton = document.querySelector('.change-shape-button');
changeShapeButton.addEventListener('click', function() {
    currentGeometryIndex++;
    if (currentGeometryIndex >= pyramidGeometries.length) {
        currentGeometryIndex = 0;
    }
    var newGeometry = pyramidGeometries[currentGeometryIndex];
    pyramid.geometry.dispose();
    pyramid.geometry = newGeometry;
});

// Hàm kiểm tra va chạm
// Hàm kiểm tra va chạm
function checkCollision() {
    var pyramidBottom = new THREE.Box3().setFromObject(pyramid);
    var squareBox = new THREE.Box3().setFromObject(square);

    if (pyramidBottom.intersectsBox(squareBox)) {
        showMessage("ĐANG NẰM TRÊN CÙNG MẶT PHẲNG", "green");
    } else {
        showMessage("KHÔNG NẰM TRÊN CÙNG MẶT PHẲNG", "red");
    }
}

// Hàm hiển thị thông báo
function showMessage(message, color) {
    var messageElement = document.querySelector('.message');
    messageElement.textContent = message;
    messageElement.className = "message " + color;
}




// Render scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Thêm sự kiện cho chuột
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);
// Di chuyển Cam khi cuộn chuột
window.addEventListener('mousewheel', onMouseWheel);
window.addEventListener('DOMMouseScroll', onMouseWheel);

function onMouseWheel(event) {
    var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
    var moveSpeed = 0.7; // Tốc độ di chuyển

    // Di chuyển camera về phía trước khi cuộn chuột lên
    if (delta < 0) {
        var direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, -moveSpeed);
    }
    // Di chuyển camera lùi sau khi cuộn chuột xuống
    else if (delta > 0) {
        var direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, moveSpeed);
    }
}

// Xử lý sự kiện khi nhấp vào nút "RESET"
var resetButton = document.querySelector('.reset-button');
resetButton.addEventListener('click', function() {
    pyramid.position.set(0, 2, 0);
    showMessage("", "");
});
// Lắng nghe sự kiện khi giá trị của slider thay đổi
var opacitySlider = document.querySelector('.PB-range-slider');
opacitySlider.addEventListener('input', function(event) {
    var opacityValue = parseFloat(event.target.value);
    squareMaterial.opacity = opacityValue;
    squareMaterial.transparent = opacityValue < 1;
    squareMaterial.needsUpdate = true;
});
//loading
// Lấy phần tử overlay và loader
var overlay = document.getElementById("overlay");
var loader = document.querySelector(".loader");

// Thiết lập hiển thị overlay và loader
overlay.style.display = "block";
loader.style.display = "block";

// Đợi 2 giây
setTimeout(function() {
  // Ẩn overlay và loader
  overlay.style.display = "none";
  loader.style.display = "none";
}, 3000);
