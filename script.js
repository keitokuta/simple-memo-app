// グローバル変数として編集中のメモIDを保持
let editingMemoId = null;

/**
 * 編集モーダルを開く関数
 */
function openEditModal(memoId) {
    const memos = loadMemos();
    const memo = memos.find((m) => m.id == memoId);

    if (!memo) {
        alert("編集対象のメモが見つかりません。");
        return;
    }

    // 編集中のメモIDを保存
    editingMemoId = memoId;

    // モーダルの入力欄に現在の内容をセット
    const editInput = document.getElementById("edit-memo-input");
    editInput.value = memo.content;

    // モーダルを表示
    const modal = document.getElementById("edit-modal");
    modal.style.display = "flex";

    // 入力欄にフォーカス
    editInput.focus();
}

/**
 * モーダルを閉じる関数
 */
function closeEditModal() {
    const modal = document.getElementById("edit-modal");
    modal.style.display = "none";
    editingMemoId = null;

    // 入力欄をクリア
    document.getElementById("edit-memo-input").value = "";
}

/**
 * メモを更新する関数
 */
function updateMemo() {
    if (!editingMemoId) {
        alert("編集対象のメモが特定できません。");
        return;
    }

    const newContent = document.getElementById("edit-memo-input").value.trim();

    if (newContent === "") {
        alert("メモ内容が空です。");
        return;
    }

    // メモ一覧を取得
    let memos = loadMemos();

    // 該当のメモを見つけて更新
    const memoIndex = memos.findIndex((m) => m.id == editingMemoId);

    if (memoIndex === -1) {
        alert("編集対象のメモが見つかりません。");
        return;
    }

    // 内容を更新
    memos[memoIndex].content = newContent;
    memos[memoIndex].updatedAt = new Date().toISOString();

    // ローカルストレージに保存
    localStorage.setItem("memos", JSON.stringify(memos));

    // モーダルを閉じる
    closeEditModal();

    // 一覧を再描画
    renderMemoList();

    alert("メモを更新しました！");
}

function loadMemos() {
    const memosString = localStorage.getItem("memos");
    if (memosString) {
        try {
            return JSON.parse(memosString);
        } catch (e) {
            console.error("メモデータの読み込みエラー:", e);
            return [];
        }
    }
    return [];
}

/**
 * メモを削除する関数
 */
function deleteMemo(memoId) {
    try {
        if (!confirm("このメモを削除しますか？")) {
            return;
        }

        let memos = loadMemos();
        const originalLength = memos.length;

        memos = memos.filter((memo) => memo.id != memoId);

        // 削除されたかチェック
        if (memos.length === originalLength) {
            alert("削除対象のメモが見つかりませんでした。");
            return;
        }

        localStorage.setItem("memos", JSON.stringify(memos));
        renderMemoList();

        alert("メモを削除しました。");
    } catch (error) {
        console.error("削除エラー:", error);
        alert("メモの削除に失敗しました。");
    }
}

/**
 * メモ一覧を画面に表示する（編集ボタンのイベント追加版）
 */
function renderMemoList() {
    const memoListDiv = document.getElementById("memo-list");
    memoListDiv.innerHTML = "";

    const memos = loadMemos();

    if (memos.length === 0) {
        memoListDiv.innerHTML = '<p class="no-memos">メモがありません。</p>';
        return;
    }

    memos.forEach((memo) => {
        const memoDiv = document.createElement("div");
        memoDiv.className = "memo-item";
        memoDiv.setAttribute("data-id", memo.id);

        const contentDiv = document.createElement("div");
        contentDiv.className = "memo-content";
        contentDiv.textContent = memo.content;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "memo-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "編集";
        editBtn.setAttribute("data-id", memo.id);

        // 編集ボタンのクリックイベントを追加
        editBtn.addEventListener("click", function () {
            const memoId = this.getAttribute("data-id");
            openEditModal(memoId);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "削除";
        deleteBtn.setAttribute("data-id", memo.id);

        // 削除ボタンのクリックイベント
        deleteBtn.addEventListener("click", function () {
            const memoId = this.getAttribute("data-id");
            deleteMemo(memoId);
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        memoDiv.appendChild(contentDiv);
        memoDiv.appendChild(actionsDiv);

        memoListDiv.appendChild(memoDiv);
    });
}

// ページ読み込み完了時の処理
document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("save-btn");
    const memoInput = document.getElementById("memo-input");
    const updateBtn = document.getElementById("update-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const closeBtn = document.querySelector(".close");

    // 初回読み込み時にメモ一覧を表示
    renderMemoList();

    // 保存ボタンのイベントリスナー
    saveButton.addEventListener("click", function () {
        const memoText = memoInput.value.trim();

        if (memoText === "") {
            alert("メモ内容が空です。");
            return;
        }

        let memos = loadMemos();

        const newMemo = {
            id: Date.now(),
            content: memoText,
            createdAt: new Date().toISOString(),
        };
        memos.push(newMemo);

        localStorage.setItem("memos", JSON.stringify(memos));

        memoInput.value = "";
        renderMemoList();

        alert("メモを保存しました！");
    });

    // 更新ボタンのイベントリスナー
    updateBtn.addEventListener("click", updateMemo);

    // キャンセルボタンのイベントリスナー
    cancelBtn.addEventListener("click", closeEditModal);

    // 閉じるボタン（×）のイベントリスナー
    closeBtn.addEventListener("click", closeEditModal);

    // モーダル外クリックで閉じる
    window.addEventListener("click", function (event) {
        const modal = document.getElementById("edit-modal");
        if (event.target === modal) {
            closeEditModal();
        }
    });
});
