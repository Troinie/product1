// changeStatus
const buttonsChangeStatus = document.querySelectorAll("[button-change-status]");
if (buttonsChangeStatus.length > 0) {
    const formChangeStatus = document.querySelector("#form-change-status")
    const path = formChangeStatus.getAttribute("data-path");
    // console.log(path);

    buttonsChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const statusCurent = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");

            let statusChange = statusCurent == "active" ? "inactive" : "active"

            const action = path + `/${statusChange}/${id}?_method=PATCH`;

            formChangeStatus.action = action;

            formChangeStatus.submit();
        });
    });
} 


//delete item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {
    const formDeleteItem = document.querySelector("#form-delete-item");
    const path = formDeleteItem.getAttribute("data-path");

    buttonsDelete.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có chắc muốn xoá sản phẩm này ?");

            if (isConfirm) {
                const id = button.getAttribute("data-id");

                const action = `${path}/${id}?_method=DELETE`;

                formDeleteItem.action = action;
                formDeleteItem.submit();
            } 

        });
    });
}