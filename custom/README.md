# ENISHI 3D Custom Glove Prototype

GitHub Pagesでそのまま動く静的サイトです。

## できること
- 3Dグローブ風モデルをドラッグ回転
- ズーム
- 360°自動回転
- 本体カラー変更
- レース色変更
- ステッチ色変更
- 刺繍文字・色・書体変更
- 選択内容のサマリー表示
- デザインをlocalStorageに保存
- Web Share APIで共有

## GitHubへの入れ方
1. `enishi-glove/glove-lp` リポジトリを開く
2. `custom` フォルダを作る
3. このフォルダ内の `index.html` / `styles.css` / `app.js` を `custom` にアップロード
4. GitHub Pagesが `main / (root)` なら数分後に公開
5. URLは `https://enishi-glove.github.io/glove-lp/custom/`

## 注意
この試作版の3DはThree.jsでプログラム生成した「グローブ風モデル」です。
本物のグローブ形状にするには、最終的に `glove.glb` 等の3Dモデルへ差し替えるのが理想です。
その場合は Blender / RealityCapture / Polycam 等で3Dデータ化し、Three.js の GLTFLoader で読み込みます。
